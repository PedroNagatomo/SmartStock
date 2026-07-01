import { useRecommendations, useProducts } from '../hooks/useApi';
import { useToast } from '../context/ToastContext';
import { AlertTriangle, Package, Truck, Clock } from 'lucide-react';
import { getRiskColor } from '../utils/format';


export default function PurchasesPage() {
  const { addToast } = useToast();
  const { data: recommendations, isLoading, refetch } = useRecommendations();
  const { data: products } = useProducts();

  const handleOrder = (_productId: number, suggestedOrder: number) => {
    // Aqui poderia abrir um modal ou integração com fornecedor
    addToast('success', `Pedido de ${suggestedOrder} unid. enviado ao fornecedor!`);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Recomendações de Compra</h1>
          <p className="text-gray-600 mt-1">
            Baseado na previsão de demanda e níveis de estoque
          </p>
        </div>
        <button onClick={() => refetch()} className="btn-secondary">
          Atualizar previsões
        </button>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="card bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-200 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-red-700">Urgência Alta</p>
              <p className="text-2xl font-bold text-red-800">
                {recommendations?.filter((r) => r.urgency === 'ALTA').length || 0}
              </p>
            </div>
          </div>
        </div>
        <div className="card bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-200 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-yellow-700">Urgência Média</p>
              <p className="text-2xl font-bold text-yellow-800">
                {recommendations?.filter((r) => r.urgency === 'MÉDIA').length || 0}
              </p>
            </div>
          </div>
        </div>
        <div className="card bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-200 rounded-lg">
              <Package className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-green-700">Planejadas</p>
              <p className="text-2xl font-bold text-green-800">
                {recommendations?.filter((r) => r.urgency === 'BAIXA').length || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de recomendações */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Produtos para Reposição</h2>
        {isLoading ? (
          <div className="text-center py-8 text-gray-500">Carregando recomendações...</div>
        ) : !recommendations || recommendations.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Package className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            Nenhuma compra necessária no momento. Estoque está adequado!
          </div>
        ) : (
          <div className="space-y-4">
            {recommendations.map((rec) => {
              const product = products?.find((p) => p.id === rec.productId);
              return (
                <div
                  key={rec.productId}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="font-medium text-gray-900">{rec.productName}</h3>
                        <span className="text-sm text-gray-500 font-mono">{rec.sku}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          rec.urgency === 'ALTA' ? 'bg-red-100 text-red-700' :
                          rec.urgency === 'MÉDIA' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {rec.urgency}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
                        <span>Estoque atual: <strong>{rec.currentStock}</strong></span>
                        <span>Sugestão: <strong className="text-blue-600">{rec.suggestedOrder} unid.</strong></span>
                        {product && (
                          <span>Est. máximo: {product.maximumStock}</span>
                        )}
                      </div>
                      <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${getRiskColor(rec.stockoutRisk)}`}
                          style={{ width: `${rec.stockoutRisk}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleOrder(rec.productId, rec.suggestedOrder)}
                        className="btn-primary flex items-center space-x-2"
                      >
                        <Truck className="h-4 w-4" />
                        <span>Pedir {rec.suggestedOrder} unid.</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}