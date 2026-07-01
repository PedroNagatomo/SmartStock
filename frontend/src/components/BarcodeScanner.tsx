import { useEffect, useRef, useState, useCallback } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { Camera, X, CheckCircle2, RefreshCw } from "lucide-react";

interface BarcodeScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (barcode: string) => void;
  scanLabel?: string;
}

export default function BarcodeScanner({
  isOpen,
  onClose,
  onScan,
  scanLabel = "Escanear código de barras",
}: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(true);
  const [lastScanned, setLastScanned] = useState<string | null>(null);
  const controlsRef = useRef<any>(null);
  const lastScannedRef = useRef<string | null>(null); // Ref para evitar closure desatualizado
  const [manualInput, setManualInput] = useState("");
  const [showManualInput, setShowManualInput] = useState(false);

  const stopScanner = useCallback(() => {
    if (controlsRef.current) {
      try {
        controlsRef.current.stop();
      } catch (e) {
        console.warn("Erro ao parar scanner:", e);
      }
      controlsRef.current = null;
    }
  }, []);

  const startScanner = useCallback(async () => {
    try {
      setError(null);
      setScanning(true);
      setLastScanned(null);
      lastScannedRef.current = null;

      const reader = new BrowserMultiFormatReader();
      // Método estático -> BrowserMultiFormatReader.listVideoInputDevices()
      const videoInputDevices =
        await BrowserMultiFormatReader.listVideoInputDevices();

      if (videoInputDevices.length === 0) {
        setError("Nenhuma câmera encontrada neste dispositivo.");
        return;
      }

      // Priorizar câmera traseira
      let selectedDeviceId = videoInputDevices[0].deviceId;
      for (const device of videoInputDevices) {
        const label = device.label.toLowerCase();
        if (
          label.includes("back") ||
          label.includes("traseira") ||
          label.includes("environment")
        ) {
          selectedDeviceId = device.deviceId;
          break;
        }
      }

      const controls = await reader.decodeFromVideoDevice(
        selectedDeviceId,
        videoRef.current!,
        (result, err) => {
          if (result) {
            const barcode = result.getText();
            // Evita múltiplos scans do mesmo código em sequência
            if (barcode !== lastScannedRef.current) {
              lastScannedRef.current = barcode;
              setLastScanned(barcode);
              onScan(barcode);
              controls.stop();
              setScanning(false);
              controlsRef.current = null;
            }
          }
          if (err && err.name !== "NotFoundException") {
            console.debug("Erro de leitura:", err.message);
          }
        },
      );

      controlsRef.current = controls;
    } catch (err: any) {
      console.error("Erro ao acessar a câmera:", err);
      if (
        err.name === "NotAllowedError" ||
        err.message?.includes("permission")
      ) {
        setError(
          "Permissão de câmera negada. Por favor, libere o acesso nas configurações do navegador.",
        );
      } else if (err.name === "NotFoundError") {
        setError("Nenhuma câmera encontrada.");
      } else {
        setError(
          "Erro ao acessar a câmera. Verifique se a câmera está disponível e as permissões foram concedidas.",
        );
      }
    }
  }, [onScan]);

  useEffect(() => {
    if (!isOpen) return;

    startScanner();

    return () => {
      stopScanner();
    };
  }, [isOpen, startScanner, stopScanner]);

  const handleClose = () => {
    stopScanner();
    onClose();
  };

  const handleRetry = () => {
    stopScanner();
    startScanner();
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualInput.trim()) {
      onScan(manualInput.trim());
      setManualInput("");
      setShowManualInput(false);
      // Opcional: fechar o scanner após envio
      // onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Camera className="h-5 w-5 text-blue-600" />
            {scanLabel}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Scanner area */}
        <div className="relative bg-black aspect-video">
          {error ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4">
              <p className="text-center mb-4">{error}</p>
              <button
                onClick={handleRetry}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <RefreshCw className="h-4 w-4" />
                Tentar novamente
              </button>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                muted
                playsInline
              />
              {/* Área de varredura visual */}
              <div className="absolute inset-0 border-2 border-blue-400/50 m-12 rounded-lg pointer-events-none" />
              {scanning && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="h-0.5 w-3/4 bg-blue-400 animate-pulse" />
                </div>
              )}
              {!scanning && lastScanned && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 text-white">
                  <CheckCircle2 className="h-12 w-12 text-green-400 mb-2" />
                  <p className="text-xl font-mono">{lastScanned}</p>
                  <p className="text-sm mt-1">Código capturado!</p>
                  <button
                    onClick={handleRetry}
                    className="mt-4 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Escanear novamente
                  </button>
                </div>
              )}
            </>
          )}
        </div>
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          {!showManualInput ? (
            <button
              onClick={() => setShowManualInput(true)}
              className="text-sm text-blue-600 hover:text-blue-700 underline"
            >
              Não conseguiu escanear? Digite o código manualmente
            </button>
          ) : (
            <form onSubmit={handleManualSubmit} className="flex gap-2">
              <input
                type="text"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                placeholder="Digite o código de barras"
                className="input flex-1 text-sm py-2"
                autoFocus
              />
              <button type="submit" className="btn btn-primary text-sm">
                Buscar
              </button>
              <button
                type="button"
                onClick={() => setShowManualInput(false)}
                className="btn btn-secondary text-sm"
              >
                Cancelar
              </button>
            </form>
          )}
        </div>

        <div className="p-4 bg-gray-50 text-center text-sm text-gray-500">
          Posicione o código de barras na área marcada. A leitura é automática.
        </div>
      </div>
    </div>
  );
}
