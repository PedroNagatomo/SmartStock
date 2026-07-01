import { useState, useEffect } from "react";
import { X, Search, Save, ShoppingBag } from "lucide-react";
import { useProducts, useRecordSale } from "../hooks/useApi";
import { useToast } from "../context/ToastContext";
import type { Product } from "../types";

interface SaleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SaleFormModal({ isOpen, onClose }: SaleFormModalProps) {
  const { addToast } = useToast();
  const { data: products } = useProducts();
  const recordSaleMutation = useRecordSale();
  const [searchTerm, setSearchTerm] = useState("");
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
      addToast("error", "Selecione um produto");
      return;
    }
    if (quantity < 1) {
      addToast("error", "Quantidade inválida");
      return;
    }
    try {
      await recordSaleMutation.mutateAsync({
        productId: selectedProduct.id,
        quantity,
        unitPrice: unitPrice || selectedProduct.unitPrice,
      });
      addToast("success", `Venda de ${quantity} un. registrada!`);
      onClose();
    } catch (err: any) {
      addToast("error", "Erro ao registrar venda", err.response?.data?.message);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setSelectedProduct(null);
      setSearchTerm("");
      setQuantity(1);
      setUnitPrice(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Overlay com vidro fosco */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-fade-in border border-slate-100">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-blue-50">
              <ShoppingBag className="h-5 w-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Nova Venda</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Busca do produto */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Produto *
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por nome ou SKU..."
                className="input pl-10"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowProductList(true);
                  setSelectedProduct(null);
                }}
                onFocus={() => setShowProductList(true)}
              />
              {showProductList && searchTerm && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                  {filteredProducts?.length === 0 ? (
                    <p className="p-3 text-sm text-slate-500">Nenhum produto encontrado</p>
                  ) : (
                    filteredProducts?.map((product) => (
                      <button
                        key={product.id}
                        type="button"
                        className="w-full text-left px-4 py-3 hover:bg-slate-50 flex justify-between items-center transition-colors"
                        onClick={() => handleSelectProduct(product)}
                      >
                        <span className="font-medium text-slate-800">{product.name}</span>
                        <span className="text-xs text-slate-400 font-mono">{product.sku}</span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
            {selectedProduct && (
              <div className="mt-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex justify-between text-sm">
                <span>
                  Estoque: <strong>{selectedProduct.currentStock}</strong>
                </span>
                <span>
                  Preço: <strong>{formatCurrency(selectedProduct.unitPrice)}</strong>
                </span>
              </div>
            )}
          </div>

          {/* Quantidade */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Quantidade *
            </label>
            <input
              type="number"
              min="1"
              max={selectedProduct?.currentStock || 999}
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              className="input"
            />
          </div>

          {/* Preço unitário opcional */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Preço Unitário (opcional)
            </label>
            <input
              type="number"
              step="0.01"
              value={unitPrice}
              onChange={(e) => setUnitPrice(parseFloat(e.target.value) || 0)}
              className="input"
              placeholder={selectedProduct ? `Sugerido: ${selectedProduct.unitPrice}` : "0.00"}
            />
          </div>

          {/* Ações */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={recordSaleMutation.isPending || !selectedProduct}
              className="btn btn-primary"
            >
              <Save className="h-4 w-4" />
              Registrar Venda
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Helper inline (evita import desnecessário se já existir no utils)
function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}