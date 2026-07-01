import { useState } from 'react';
import { useAlerts } from '../hooks/useApi';
import { AlertTriangle, Clock, ShoppingCart, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { getSeverityColor, getRiskColor } from '../utils/format';


export default function AlertsPage() {
  const [filter, setFilter] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const { data: alerts, isLoading } = useAlerts(filter);

  const criticalCount = alerts?.filter((a) => a.severity === 'ALTO').length || 0;
  const mediumCount = alerts?.filter((a) => a.severity === 'MÉDIO').length || 0;
  const lowCount = alerts?.filter((a) => a.severity === 'BAIXO').length || 0;

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Alertas de Estoque</h1>
          <p className="text-gray-600 mt-1">
            {alerts?.length || 0} produtos precisam de atenção
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-gray-400" />
          <select
            className="input-field w-40"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="">Todos</option>
            <option value="ALTO">Críticos ({criticalCount})</option>
            <option value="MÉDIO">Médios ({mediumCount})</option>
            <option value="BAIXO">Baixos ({lowCount})</option>
          </select>
        </div>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="card bg-red-50 border-red-200 cursor-pointer" onClick={() => setFilter('ALTO')}>
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-8 w-8 text-red-600" />
            <div>
              <p className="text-sm text-red-700">Críticos</p>
              <p className="text-2xl font-bold text-red-800">{criticalCount}</p>
            </div>
          </div>
        </div>
        <div className="card bg-yellow-50 border-yellow-200 cursor-pointer" onClick={() => setFilter('MÉDIO')}>
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-8 w-8 text-yellow-600" />
            <div>
              <p className="text-sm text-yellow-700">Atenção</p>
              <p className="text-2xl font-bold text-yellow-800">{mediumCount}</p>
            </div>
          </div>
        </div>
        <div className="card bg-green-50 border-green-200 cursor-pointer" onClick={() => setFilter('BAIXO')}>
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-sm text-green-700">Observar</p>
              <p className="text-2xl font-bold text-green-800">{lowCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de alertas detalhados */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8 text-gray-500">Carregando alertas...</div>
        ) : alerts?.length === 0 ? (
          <div className="card text-center py-12">
            <AlertTriangle className="h-12 w-12 mx-auto mb-2 text-green-400" />
            <p className="text-gray-500">Nenhum alerta no momento. Estoque sob controle!</p>
          </div>
        ) : (
          alerts?.map((alert) => (
            <div
              key={alert.productId}
              className="card hover:shadow-md transition-all cursor-pointer"
              onClick={() => toggleExpand(alert.productId)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1">
                  <div className={`p-3 rounded-lg ${
                    alert.severity === 'ALTO' ? 'bg-red-100' :
                    alert.severity === 'MÉDIO' ? 'bg-yellow-100' : 'bg-green-100'
                  }`}>
                    <AlertTriangle className={`h-6 w-6 ${
                      alert.severity === 'ALTO' ? 'text-red-600' :
                      alert.severity === 'MÉDIO' ? 'text-yellow-600' : 'text-green-600'
                    }`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{alert.productName}</h3>
                    <p className="text-sm text-gray-500">SKU: {alert.sku}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(alert.severity)}`}>
                    {alert.severity}
                  </span>
                  {expandedId === alert.productId ? (
                    <ChevronUp className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  )}
                </div>
              </div>

              {/* Detalhes expandidos */}
              {expandedId === alert.productId && (
                <div className="mt-4 pt-4 border-t space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Estoque Atual</p>
                      <p className="text-xl font-bold">{alert.currentStock}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Ponto Reposição</p>
                      <p className="text-xl font-bold">{alert.reorderPoint}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Dias até Ruptura</p>
                      <p className="text-xl font-bold text-red-600 flex items-center">
                        <Clock className="h-5 w-5 mr-1" />
                        {alert.daysUntilStockout}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Compra Sugerida</p>
                      <p className="text-xl font-bold text-blue-600">
                        {alert.suggestedOrder > 0 ? `${alert.suggestedOrder} un.` : '-'}
                      </p>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Risco de Ruptura</span>
                      <span className="font-medium">{alert.stockoutRisk.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all ${getRiskColor(alert.stockoutRisk)}`}
                        style={{ width: `${alert.stockoutRisk}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">{alert.message}</p>
                    {alert.suggestedOrder > 0 && (
                      <button className="btn-primary flex items-center space-x-2">
                        <ShoppingCart className="h-4 w-4" />
                        <span>Comprar {alert.suggestedOrder} unid.</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}