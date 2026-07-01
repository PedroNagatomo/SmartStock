import { useState } from "react";
import { useProducts, useUpdateProduct } from "../hooks/useApi";
import { useToast } from "../context/ToastContext";
import ProductFormModal from "../components/ProductFormModal";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Package,
  ArrowUpDown,
  RefreshCw,
} from "lucide-react";
import type { Product } from "../types";
import { formatCurrency } from "../utils/format";

export default function ProductsPage() {
  const { addToast } = useToast();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortField, setSortField] = useState<"name" | "currentStock" | "unitPrice">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const { data: products, isLoading, refetch } = useProducts(category, search);
  const updateMutation = useUpdateProduct();

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleNew = () => {
    setSelectedProduct(null);
    setIsModalOpen(true);
  };

  const handleDeactivate = async (product: Product) => {
    if (!confirm(`Desativar "${product.name}"?`)) return;
    try {
      await updateMutation.mutateAsync({ id: product.id, data: { active: false } as any });
      addToast("success", "Produto desativado");
      refetch();
    } catch (err: any) {
      addToast("error", "Erro", err.response?.data?.message);
    }
  };

  const sortedProducts = products
    ? [...products].sort((a: any, b: any) => {
        let valA, valB;
        if (sortField === "name") { valA = a.name; valB = b.name; }
        else if (sortField === "currentStock") { valA = a.currentStock; valB = b.currentStock; }
        else { valA = a.unitPrice; valB = b.unitPrice; }
        if (valA < valB) return sortOrder === "asc" ? -1 : 1;
        if (valA > valB) return sortOrder === "asc" ? 1 : -1;
        return 0;
      })
    : [];

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) setSortOrder((s) => (s === "asc" ? "desc" : "asc"));
    else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Produtos</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {products?.length || 0} produtos ativos
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => refetch()} className="btn btn-secondary">
            <RefreshCw className="h-4 w-4" /> Atualizar
          </button>
          <button onClick={handleNew} className="btn btn-primary">
            <Plus className="h-4 w-4" /> Novo Produto
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar produto por nome ou SKU..."
              className="input pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="input sm:w-48"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">Todas categorias</option>
            <option value="Vestuário">Vestuário</option>
            <option value="Calçados">Calçados</option>
            <option value="Acessórios">Acessórios</option>
            <option value="Eletrônicos">Eletrônicos</option>
            <option value="Outros">Outros</option>
          </select>
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/70">
                <th
                  className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-700"
                  onClick={() => toggleSort("name")}
                >
                  <div className="flex items-center gap-1">Produto <ArrowUpDown className="h-3 w-3" /></div>
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">SKU</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Categoria</th>
                <th
                  className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => toggleSort("currentStock")}
                >
                  <div className="flex items-center gap-1">Estoque <ArrowUpDown className="h-3 w-3" /></div>
                </th>
                <th
                  className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => toggleSort("unitPrice")}
                >
                  <div className="flex items-center gap-1">Preço <ArrowUpDown className="h-3 w-3" /></div>
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <RefreshCw className="animate-spin h-6 w-6 mx-auto mb-2 text-slate-400" />
                    <p className="text-sm text-slate-500">Carregando...</p>
                  </td>
                </tr>
              ) : sortedProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <Package className="h-10 w-10 mx-auto mb-2 text-slate-300" />
                    <p className="text-sm text-slate-500">Nenhum produto encontrado</p>
                  </td>
                </tr>
              ) : (
                sortedProducts.map((product: Product) => (
                  <tr
                    key={product.id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-slate-800">
                      {product.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 font-mono">
                      {product.sku}
                    </td>
                    <td className="px-6 py-4">
                      <span className="badge badge-info">
                        {product.category || "Sem cat."}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-semibold ${
                            product.currentStock <= product.minimumStock
                              ? "text-red-600"
                              : product.currentStock <= product.minimumStock * 1.5
                              ? "text-amber-600"
                              : "text-slate-700"
                          }`}
                        >
                          {product.currentStock}
                        </span>
                        <span className="text-xs text-slate-400">
                          / {product.minimumStock} min
                        </span>
                      </div>
                      {product.currentStock <= product.minimumStock && (
                        <span className="text-xs text-red-500 font-medium">
                          ⚠ Abaixo do mínimo
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-700">
                      {formatCurrency(product.unitPrice)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`badge ${
                          product.active ? "badge-success" : "badge-danger"
                        }`}
                      >
                        {product.active ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleEdit(product)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeactivate(product)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Desativar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ProductFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
      />
    </div>
  );
}