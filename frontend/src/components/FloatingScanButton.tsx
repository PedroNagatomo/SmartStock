import { useState } from 'react';
import { Scan } from 'lucide-react';
import BarcodeScanner from './BarcodeScanner';
import { useNavigate } from 'react-router-dom';
import { productService } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function FloatingScanButton() {
  const [showScanner, setShowScanner] = useState(false);
  const navigate = useNavigate();
  const { addToast } = useToast();

  const handleScan = async (barcode: string) => {
    setShowScanner(false);
    try {
      await productService.getBySku(barcode);
      // Redireciona para a página de produtos com o SKU na busca
      navigate(`/products?search=${barcode}`);
    } catch (err: any) {
      addToast('error', 'Produto não encontrado', `SKU: ${barcode}`);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowScanner(true)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all flex items-center justify-center active:scale-95"
        title="Escanear código de barras"
      >
        <Scan className="h-6 w-6" />
      </button>

      <BarcodeScanner
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        onScan={handleScan}
        scanLabel="Escanear Código de Barras"
      />
    </>
  );
}