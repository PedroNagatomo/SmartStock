import { useEffect, useState } from "react";
import { useProducts, useRecordSale } from "../hooks/useApi";
import { useToast } from "../context/ToastContext";
import SaleFormModal from "../components/SaleFormModal";
import { Plus, History, WifiOff, Zap } from "lucide-react";

import { formatCurrency } from "../utils/format";
import type { Product } from "../types";
import { useOfflineSync } from "../hooks/useOfflineQueue";

export default function SalesPage() {
  const { syncPendingSales, addToQueue } = useOfflineSync();
  const { addToast } = useToast();
  const { data: products } = useProducts();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [quickSaleProduct, setQuickSaleProduct] = useState<Product | null>(
    null,
  );
  const [quickQuantity, setQuickQuantity] = useState(1);
  const recordSaleMutation = useRecordSale();

  const handleQuickSale = async (product: Product) => {
    if (!quickQuantity || quickQuantity < 1) {
      addToast("error", "Quantidade inválida");
      return;
    }

    const saleData = {
      productId: product.id,
      quantity: quickQuantity,
      unitPrice: product.unitPrice,
    };

    if (navigator.onLine) {
      try {
        await recordSaleMutation.mutateAsync(saleData);
        addToast(
          "success",
          `Venda de ${quickQuantity} ${product.name} registrada!`,
        );
      } catch (err: any) {
        addToast("error", "Erro", err.response?.data?.message);
      }
    } else {
      await addToQueue(saleData);
      addToast(
        "success",
        `Venda salva localmente! Será sincronizada quando online.`,
      );
    }

    setQuickQuantity(1);
    setQuickSaleProduct(null);
  };

  useEffect(() => {
    const handleOnline = () => syncPendingSales();
    window.addEventListener("appOnline", handleOnline);
    return () => window.removeEventListener("appOnline", handleOnline);
  }, [syncPendingSales]);

  useEffect(() => {
    if (navigator.onLine) syncPendingSales();
  }, []);

  const offlineBanner = !navigator.onLine && (
    <div className="mb-6 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2 text-amber-800 text-sm font-medium animate-fade-in">
      <WifiOff className="h-4 w-4" />
      Modo offline – as vendas serão sincronizadas quando a conexão voltar.
    </div>
  );

  return (
    <div className="space-y-8 p-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Vendas</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Registre vendas de forma rápida
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn btn-primary"
        >
          <Plus className="h-4 w-4" /> Nova Venda
        </button>
      </div>

      {offlineBanner}

      {/* Venda rápida */}
      <div className="card">
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 rounded-lg bg-blue-50">
            <Zap className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-800">
              Venda Rápida
            </h2>
            <p className="text-sm text-slate-500">Produtos mais frequentes</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products?.slice(0, 6).map((product) => (
            <div
              key={product.id}
              className="group border border-slate-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-md transition-all duration-200 bg-white"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="min-w-0">
                  <p className="font-semibold text-slate-800 truncate">
                    {product.name}
                  </p>
                  <p className="text-xs text-slate-400 font-mono">
                    {product.sku}
                  </p>
                </div>
                <span className="text-sm font-bold text-slate-700">
                  {formatCurrency(product.unitPrice)}
                </span>
              </div>

              <div className="flex items-center gap-2 mt-3">
                <input
                  type="number"
                  min="1"
                  max={product.currentStock}
                  value={
                    quickSaleProduct?.id === product.id ? quickQuantity : 1
                  }
                  onChange={(e) => {
                    setQuickSaleProduct(product);
                    setQuickQuantity(parseInt(e.target.value) || 1);
                  }}
                  className="input w-20 py-2 text-center"
                />
                <button
                  onClick={() => handleQuickSale(product)}
                  disabled={recordSaleMutation.isPending}
                  className="btn btn-primary flex-1 py-2 justify-center text-sm"
                >
                  Vender
                </button>
              </div>

              <div className="mt-2 flex items-center justify-between text-xs">
                <span className="text-slate-400">
                  Estoque:{" "}
                  <span
                    className={`font-semibold ${product.currentStock <= product.minimumStock ? "text-red-600" : "text-slate-600"}`}
                  >
                    {product.currentStock}
                  </span>
                </span>
                {product.currentStock <= product.minimumStock && (
                  <span className="text-red-500 font-medium">⚠ Baixo</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Histórico */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-slate-100">
            <History className="h-5 w-5 text-slate-500" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-800">
              Últimas Vendas
            </h2>
            <p className="text-sm text-slate-500">Histórico em breve</p>
          </div>
        </div>
        <p className="text-slate-400 text-sm">
          O histórico detalhado estará disponível em uma próxima atualização.
        </p>
      </div>

      <SaleFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
