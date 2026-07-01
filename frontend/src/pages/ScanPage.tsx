import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Scan, Package, AlertCircle, Search } from 'lucide-react';
import BarcodeScanner from '../components/BarcodeScanner';
import { productService } from '../services/api';
import { useToast } from '../context/ToastContext';
import type { Product } from '../types';

export default function ScanPage() {
  const [showScanner, setShowScanner] = useState(false);
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState('');
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleScan = async (barcode: string) => {
    setScannedCode(barcode);
    setManualCode('');
    await buscarProduto(barcode);
  };

  const handleManualSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    const code = manualCode.trim();
    setScannedCode(code);
    await buscarProduto(code);
  };

  const buscarProduto = async (codigo: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await productService.getBySku(codigo);
      setProduct(response.data);
      addToast('success', `Produto encontrado: ${response.data.name}`);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setError(`SKU "${codigo}" não encontrado no cadastro.`);
      } else {
        setError('Erro ao buscar produto. Tente novamente.');
      }
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setScannedCode(null);
    setProduct(null);
    setError(null);
    setManualCode('');
  };

  return (
    <div className="p-6 animate-fade-in">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-800 mb-6">Escanear Produto</h1>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          {!scannedCode && !loading && !error && !product && (
            <div className="space-y-8">
              <div className="text-center py-6">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-50 mb-4">
                  <Scan className="h-10 w-10 text-blue-600" />
                </div>
                <p className="text-slate-500 mb-6">
                  Escaneie o código de barras ou digite o SKU do produto.
                </p>
                <button
                  onClick={() => setShowScanner(true)}
                  className="btn btn-primary text-lg px-8 py-3"
                >
                  Abrir Câmera
                </button>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <p className="text-sm text-gray-500 mb-3 text-center">
                  Ou digite o código manualmente:
                </p>
                <form
                  onSubmit={handleManualSearch}
                  className="flex gap-3 max-w-md mx-auto"
                >
                  <input
                    type="text"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    placeholder="Código de barras / SKU"
                    className="input flex-1"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="btn btn-primary flex items-center gap-2"
                  >
                    <Search className="h-4 w-4" />
                    Buscar
                  </button>
                </form>
              </div>
            </div>
          )}

          {scannedCode && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-slate-500">Código pesquisado:</p>
                  <p className="text-xl font-mono font-bold text-slate-800">
                    {scannedCode}
                  </p>
                </div>
                <button onClick={handleReset} className="btn btn-secondary">
                  Nova consulta
                </button>
              </div>

              {loading && (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                  <span className="ml-3 text-slate-500">Buscando produto...</span>
                </div>
              )}

              {error && (
                <div className="flex items-start gap-2 bg-red-50 text-red-700 px-4 py-3 rounded-lg">
                  <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <p>{error}</p>
                    <button
                      onClick={() => {
                        setScannedCode(null);
                        setError(null);
                        setProduct(null);
                      }}
                      className="text-sm underline mt-1"
                    >
                      Tentar outro código
                    </button>
                  </div>
                </div>
              )}

              {product && (
                <div className="mt-4 p-4 border border-green-200 bg-green-50 rounded-xl">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-lg bg-white border flex items-center justify-center">
                      <Package className="h-6 w-6 text-slate-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-800">
                        {product.name}
                      </h3>
                      <p className="text-sm text-slate-500">SKU: {product.sku}</p>
                      <p className="text-sm text-slate-500">
                        Categoria: {product.category || '-'}
                      </p>
                      <p className="text-sm font-medium mt-1">
                        Estoque:{' '}
                        <span
                          className={
                            product.currentStock <= product.minimumStock
                              ? 'text-red-600'
                              : 'text-green-600'
                          }
                        >
                          {product.currentStock} unid.
                        </span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-slate-800">
                        R$ {product.unitPrice?.toFixed(2)}
                      </p>
                      <button
                        onClick={() => navigate('/products')}
                        className="mt-2 btn btn-secondary text-sm"
                      >
                        Ver detalhes
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <BarcodeScanner
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        onScan={handleScan}
      />
    </div>
  );
}