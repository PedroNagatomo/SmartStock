import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { useCreateProduct, useUpdateProduct } from '../hooks/useApi';
import { useToast } from '../context/ToastContext';
import type { Product, ProductFormData } from '../types';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product | null; // null para criação
}

export default function ProductFormModal({ isOpen, onClose, product }: ProductFormModalProps) {
  const { addToast } = useToast();
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const [formData, setFormData] = useState<ProductFormData>({
    sku: '',
    name: '',
    category: '',
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
        category: product.category || '',
        currentStock: product.currentStock,
        minimumStock: product.minimumStock,
        maximumStock: product.maximumStock,
        unitPrice: product.unitPrice,
        leadTimeDays: product.leadTimeDays,
        serviceLevel: product.serviceLevel,
      });
    } else {
      setFormData({
        sku: '',
        name: '',
        category: '',
        currentStock: 0,
        minimumStock: 0,
        maximumStock: 0,
        unitPrice: 0,
        leadTimeDays: 7,
        serviceLevel: 0.9,
      });
    }
    setErrors({});
  }, [product, isOpen]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.sku.trim()) newErrors.sku = 'SKU é obrigatório';
    if (!formData.name.trim()) newErrors.name = 'Nome é obrigatório';
    if (formData.currentStock < 0) newErrors.currentStock = 'Não pode ser negativo';
    if (formData.minimumStock < 0) newErrors.minimumStock = 'Não pode ser negativo';
    if (formData.maximumStock <= 0) newErrors.maximumStock = 'Deve ser maior que zero';
    if (formData.unitPrice <= 0) newErrors.unitPrice = 'Preço deve ser positivo';
    if (formData.leadTimeDays < 1) newErrors.leadTimeDays = 'Mínimo 1 dia';
    if (formData.serviceLevel < 0.5 || formData.serviceLevel > 1)
      newErrors.serviceLevel = 'Entre 0.5 e 1.0';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      if (product) {
        await updateMutation.mutateAsync({ id: product.id, data: formData });
        addToast('success', 'Produto atualizado com sucesso!');
      } else {
        await createMutation.mutateAsync(formData);
        addToast('success', 'Produto cadastrado com sucesso!');
      }
      onClose();
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erro ao salvar produto';
      addToast('error', 'Erro', message);
    }
  };

  const handleChange = (field: keyof ProductFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50" onClick={onClose} />
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {product ? 'Editar Produto' : 'Novo Produto'}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* SKU */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SKU *</label>
                <input
                  type="text"
                  value={formData.sku}
                  onChange={(e) => handleChange('sku', e.target.value)}
                  className={`input-field ${errors.sku ? 'border-red-500' : ''}`}
                  disabled={!!product} // SKU não pode ser alterado na edição
                />
                {errors.sku && <p className="mt-1 text-sm text-red-600">{errors.sku}</p>}
              </div>

              {/* Nome */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className={`input-field ${errors.name ? 'border-red-500' : ''}`}
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
              </div>

              {/* Categoria */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                <select
                  value={formData.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  className="input-field"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Preço Unitário *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.unitPrice}
                  onChange={(e) => handleChange('unitPrice', parseFloat(e.target.value) || 0)}
                  className={`input-field ${errors.unitPrice ? 'border-red-500' : ''}`}
                />
                {errors.unitPrice && <p className="mt-1 text-sm text-red-600">{errors.unitPrice}</p>}
              </div>

              {/* Estoque Atual */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estoque Atual</label>
                <input
                  type="number"
                  min="0"
                  value={formData.currentStock}
                  onChange={(e) => handleChange('currentStock', parseInt(e.target.value) || 0)}
                  className="input-field"
                />
              </div>

              {/* Estoque Mínimo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estoque Mínimo *</label>
                <input
                  type="number"
                  min="0"
                  value={formData.minimumStock}
                  onChange={(e) => handleChange('minimumStock', parseInt(e.target.value) || 0)}
                  className={`input-field ${errors.minimumStock ? 'border-red-500' : ''}`}
                />
                {errors.minimumStock && <p className="mt-1 text-sm text-red-600">{errors.minimumStock}</p>}
              </div>

              {/* Estoque Máximo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estoque Máximo *</label>
                <input
                  type="number"
                  min="1"
                  value={formData.maximumStock}
                  onChange={(e) => handleChange('maximumStock', parseInt(e.target.value) || 0)}
                  className={`input-field ${errors.maximumStock ? 'border-red-500' : ''}`}
                />
                {errors.maximumStock && <p className="mt-1 text-sm text-red-600">{errors.maximumStock}</p>}
              </div>

              {/* Lead Time (dias) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lead Time (dias)</label>
                <input
                  type="number"
                  min="1"
                  value={formData.leadTimeDays}
                  onChange={(e) => handleChange('leadTimeDays', parseInt(e.target.value) || 1)}
                  className="input-field"
                />
              </div>

              {/* Nível de Serviço */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nível de Serviço (0.5 a 1.0)
                </label>
                <input
                  type="number"
                  step="0.05"
                  min="0.5"
                  max="1.0"
                  value={formData.serviceLevel}
                  onChange={(e) => handleChange('serviceLevel', parseFloat(e.target.value) || 0.9)}
                  className={`input-field ${errors.serviceLevel ? 'border-red-500' : ''}`}
                />
                {errors.serviceLevel && <p className="mt-1 text-sm text-red-600">{errors.serviceLevel}</p>}
              </div>
            </div>

            {/* Botões */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button type="button" onClick={onClose} className="btn-secondary">
                Cancelar
              </button>
              <button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="btn-primary flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>{product ? 'Atualizar' : 'Cadastrar'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 