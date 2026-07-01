import { useState, useEffect } from "react";
import { X, Save, Package } from "lucide-react";
import { useCreateProduct, useUpdateProduct } from "../hooks/useApi";
import { useToast } from "../context/ToastContext";
import type { Product, ProductFormData } from "../types";

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product | null;
  initialSku?: string; // 👈 nova prop
}

export default function ProductFormModal({
  isOpen,
  onClose,
  product,
  initialSku,
}: ProductFormModalProps) {
  const { addToast } = useToast();
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const [formData, setFormData] = useState<ProductFormData>({
    sku: "",
    name: "",
    category: "",
    currentStock: 0,
    minimumStock: 0,
    maximumStock: 0,
    unitPrice: 0,
    leadTimeDays: 7,
    serviceLevel: 0.9,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (product) {
      setFormData({
        sku: product.sku,
        name: product.name,
        category: product.category || "",
        currentStock: product.currentStock,
        minimumStock: product.minimumStock,
        maximumStock: product.maximumStock,
        unitPrice: product.unitPrice,
        leadTimeDays: product.leadTimeDays,
        serviceLevel: product.serviceLevel,
      });
    } else {
      setFormData({
        sku: initialSku || "", // 👈 preenche com o código escaneado
        name: "",
        category: "",
        currentStock: 0,
        minimumStock: 0,
        maximumStock: 0,
        unitPrice: 0,
        leadTimeDays: 7,
        serviceLevel: 0.9,
      });
    }
    setErrors({});
  }, [product, initialSku, isOpen]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.sku.trim()) newErrors.sku = "SKU é obrigatório";
    if (!formData.name.trim()) newErrors.name = "Nome é obrigatório";
    if (formData.currentStock < 0)
      newErrors.currentStock = "Não pode ser negativo";
    if (formData.minimumStock < 0)
      newErrors.minimumStock = "Não pode ser negativo";
    if (formData.maximumStock <= 0)
      newErrors.maximumStock = "Deve ser maior que zero";
    if (formData.unitPrice <= 0)
      newErrors.unitPrice = "Preço deve ser positivo";
    if (formData.leadTimeDays < 1) newErrors.leadTimeDays = "Mínimo 1 dia";
    if (formData.serviceLevel < 0.5 || formData.serviceLevel > 1)
      newErrors.serviceLevel = "Entre 0.5 e 1.0";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      if (product) {
        await updateMutation.mutateAsync({ id: product.id, data: formData });
        addToast("success", "Produto atualizado com sucesso!");
      } else {
        await createMutation.mutateAsync(formData);
        addToast("success", "Produto cadastrado com sucesso!");
      }
      onClose();
    } catch (err: any) {
      const message = err.response?.data?.message || "Erro ao salvar produto";
      addToast("error", "Erro", message);
    }
  };

  const handleChange = (
    field: keyof ProductFormData,
    value: string | number,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 animate-fade-in border border-slate-100">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-blue-50">
              <Package className="h-5 w-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">
              {product ? "Editar Produto" : "Novo Produto"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* SKU */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                SKU *
              </label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => handleChange("sku", e.target.value)}
                className={`input ${errors.sku ? "input-error" : ""}`}
                disabled={!!product}
              />
              {errors.sku && (
                <p className="mt-1 text-xs text-red-500">{errors.sku}</p>
              )}
            </div>

            {/* Nome */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Nome *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className={`input ${errors.name ? "input-error" : ""}`}
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-500">{errors.name}</p>
              )}
            </div>

            {/* Categoria */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Categoria
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleChange("category", e.target.value)}
                className="input"
              >
                <option value="">Selecione...</option>
                <option value="Vestuário">Vestuário</option>
                <option value="Calçados">Calçados</option>
                <option value="Acessórios">Acessórios</option>
                <option value="Eletrônicos">Eletrônicos</option>
                <option value="Alimentos">Alimentos</option>
                <option value="Outros">Outros</option>
              </select>
            </div>

            {/* Preço Unitário */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Preço Unitário *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.unitPrice}
                onChange={(e) =>
                  handleChange("unitPrice", parseFloat(e.target.value) || 0)
                }
                className={`input ${errors.unitPrice ? "input-error" : ""}`}
              />
              {errors.unitPrice && (
                <p className="mt-1 text-xs text-red-500">{errors.unitPrice}</p>
              )}
            </div>

            {/* Estoque Atual */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Estoque Atual
              </label>
              <input
                type="number"
                min="0"
                value={formData.currentStock}
                onChange={(e) =>
                  handleChange("currentStock", parseInt(e.target.value) || 0)
                }
                className="input"
              />
            </div>

            {/* Estoque Mínimo */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Estoque Mínimo *
              </label>
              <input
                type="number"
                min="0"
                value={formData.minimumStock}
                onChange={(e) =>
                  handleChange("minimumStock", parseInt(e.target.value) || 0)
                }
                className={`input ${errors.minimumStock ? "input-error" : ""}`}
              />
              {errors.minimumStock && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.minimumStock}
                </p>
              )}
            </div>

            {/* Estoque Máximo */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Estoque Máximo *
              </label>
              <input
                type="number"
                min="1"
                value={formData.maximumStock}
                onChange={(e) =>
                  handleChange("maximumStock", parseInt(e.target.value) || 0)
                }
                className={`input ${errors.maximumStock ? "input-error" : ""}`}
              />
              {errors.maximumStock && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.maximumStock}
                </p>
              )}
            </div>

            {/* Lead Time */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Lead Time (dias)
              </label>
              <input
                type="number"
                min="1"
                value={formData.leadTimeDays}
                onChange={(e) =>
                  handleChange("leadTimeDays", parseInt(e.target.value) || 1)
                }
                className="input"
              />
            </div>

            {/* Nível de Serviço */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Nível de Serviço (0.5 - 1.0)
              </label>
              <input
                type="number"
                step="0.05"
                min="0.5"
                max="1.0"
                value={formData.serviceLevel}
                onChange={(e) =>
                  handleChange(
                    "serviceLevel",
                    parseFloat(e.target.value) || 0.9,
                  )
                }
                className={`input ${errors.serviceLevel ? "input-error" : ""}`}
              />
              {errors.serviceLevel && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.serviceLevel}
                </p>
              )}
            </div>
          </div>

          {/* Ações */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="btn btn-primary"
            >
              <Save className="h-4 w-4" />
              {product ? "Atualizar" : "Cadastrar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
