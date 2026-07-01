import { useState, useEffect } from 'react';
import { X, Save, Search } from 'lucide-react';
import { useProducts, useRecordSale } from '../hooks/useApi';
import { useToast } from '../context/ToastContext';
import type { Product } from '../types';

interface SaleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SaleFormModal({ isOpen, onClose }: SaleFormModalProps) {
  const { addToast } = useToast();
  const { data: products } = useProducts();
  const recordSaleMutation = useRecordSale();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [unitPrice, setUnitPrice] = useState<number>(0);
  const [showProductList, setShowProductList] = useState(false);

  const filteredProducts = products?.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setUnitPrice(product.unitPrice);
    setSearchTerm(`${product.name} (${product.sku})`);
    setShowProductList(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) {
      addToast('error', 'Selecione um produto');
      return;
    }
    if (quantity < 1) {
      addToast('error', 'Quantidade inválida');
      return;
    }
    try {
      await recordSaleMutation.mutateAsync({
        productId: selectedProduct.id,
        quantity,
        unitPrice,
      });
      addToast('success', `Venda de ${quantity} un. registrada!`);
      onClose();
    } catch (err: any) {
      addToast('error', 'Erro ao registrar venda', err.response?.data?.message);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setSelectedProduct(null);
      setSearchTerm('');
      setQuantity(1);
      setUnitPrice(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50" onClick={onClose} />
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Registrar Venda</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Seleção de produto com busca */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Produto *</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar produto..."
                  className="input-field pl-10"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setShowProductList(true);
                    setSelectedProduct(null);
                  }}
                  onFocus={() => setShowProductList(true)}
                />
                {showProductList && searchTerm && (
                  <div className="absolute z-10 mt-1 w-full bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {filteredProducts?.length === 0 ? (
                      <p className="p-3 text-sm text-gray-500">Nenhum produto encontrado</p>
                    ) : (
                      filteredProducts?.map((product) => (
                        <button
                          key={product.id}
                          type="button"
                          className="w-full text-left px-3 py-2 hover:bg-gray-50 flex justify-between items-center"
                          onClick={() => handleSelectProduct(product)}
                        >
                          <span className="font-medium">{product.name}</span>
                          <span className="text-sm text-gray-500">{product.sku}</span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
              {selectedProduct && (
                <div className="mt-2 p-2 bg-green-50 rounded flex justify-between text-sm">
                  <span>Estoque: <strong>{selectedProduct.currentStock}</strong></span>
                  <span>Preço: <strong>R$ {selectedProduct.unitPrice.toFixed(2)}</strong></span>
                </div>
              )}
            </div>

            {/* Quantidade */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade *</label>
              <input
                type="number"
                min="1"
                max={selectedProduct?.currentStock || 999}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className="input-field"
              />
            </div>

            {/* Preço unitário (opcional, usa do produto se não informado) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preço Unitário (opcional)
              </label>
              <input
                type="number"
                step="0.01"
                value={unitPrice}
                onChange={(e) => setUnitPrice(parseFloat(e.target.value) || 0)}
                className="input-field"
                placeholder="Preço do produto"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button type="button" onClick={onClose} className="btn-secondary">
                Cancelar
              </button>
              <button
                type="submit"
                disabled={recordSaleMutation.isPending || !selectedProduct}
                className="btn-primary flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>Registrar Venda</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}