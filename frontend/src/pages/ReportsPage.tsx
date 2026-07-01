import { useState, useEffect } from "react";
import {
  Package,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  Filter,
  Loader2,
} from "lucide-react";
import { useProducts, useAlerts, useRecommendations } from "../hooks/useApi";
import { salesService } from "../services/api";
import {
  exportStockReport,
  exportAlertsReport,
  exportSalesReport,
  exportForecastReport,
} from "../services/reportService";
import ExportButton from "../components/ExportButton";
import type { SaleRecord } from "../types";

type ReportTab = "estoque" | "alertas" | "vendas" | "forecast";

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<ReportTab>("estoque");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [salesData, setSalesData] = useState<SaleRecord[]>([]);
  const [loadingSales, setLoadingSales] = useState(false);

  const { data: products } = useProducts();
  const { data: alerts } = useAlerts();
  const { data: forecasts } = useRecommendations();

  // Carregar vendas quando a aba for selecionada
  useEffect(() => {
    if (activeTab === "vendas" && dateRange.start && dateRange.end) {
      loadSales();
    }
  }, [activeTab, dateRange]);

  const loadSales = async () => {
    if (!dateRange.start || !dateRange.end) return;
    setLoadingSales(true);
    try {
      // Buscar vendas de todos os produtos (simplificado: pega os 10 primeiros produtos)
      const allProducts = products?.slice(0, 10) || [];
      const allSales: SaleRecord[] = [];
      for (const p of allProducts) {
        const res = await salesService.getHistory(
          p.id,
          dateRange.start,
          dateRange.end,
        );
        allSales.push(...res.data);
      }
      setSalesData(allSales);
    } catch (err) {
      console.error("Erro ao carregar vendas:", err);
    } finally {
      setLoadingSales(false);
    }
  };

  const tabs: { id: ReportTab; label: string; icon: any }[] = [
    { id: "estoque", label: "Estoque", icon: Package },
    { id: "alertas", label: "Alertas", icon: AlertTriangle },
    { id: "vendas", label: "Vendas", icon: TrendingUp },
    { id: "forecast", label: "Previsão", icon: BarChart3 },
  ];

  const handleExport = (tab: ReportTab, format: "pdf" | "excel") => {
    switch (tab) {
      case "estoque":
        if (products) exportStockReport(products, format);
        break;
      case "alertas":
        if (alerts) exportAlertsReport(alerts, format);
        break;
      case "vendas":
        if (salesData.length > 0)
          exportSalesReport(salesData, format, {
            start: dateRange.start,
            end: dateRange.end,
          });
        break;
      case "forecast":
        // forecasts contém PurchaseRecommendation, não DemandForecast
        // Precisamos buscar o forecast completo
        if (products && forecasts) {
          // Mapear para o formato esperado (simplificado)
          const forecastData = forecasts.map((f) => ({
            productId: f.productId,
            averageDailyDemand: 0, // não temos esses dados na recomendação
            safetyStock: 0,
            reorderPoint: 0,
            currentStock: f.currentStock,
            suggestedOrder: f.suggestedOrder,
            stockoutRisk: f.stockoutRisk,
            daysUntilStockout: 0,
          }));
          exportForecastReport(forecastData, products, format);
        }
        break;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Relatórios</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Exporte dados em PDF ou Excel
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-1.5 flex gap-1 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap
              ${
                activeTab === tab.id
                  ? "bg-blue-50 text-blue-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
              }
            `}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Conteúdo da Tab */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        {/* Filtro de data (apenas para vendas) */}
        {activeTab === "vendas" && (
          <div className="mb-6 flex flex-col sm:flex-row items-end gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">
                Data Início
              </label>
              <input
                type="date"
                className="input py-2 text-sm"
                value={dateRange.start}
                onChange={(e) =>
                  setDateRange((prev) => ({ ...prev, start: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">
                Data Fim
              </label>
              <input
                type="date"
                className="input py-2 text-sm"
                value={dateRange.end}
                onChange={(e) =>
                  setDateRange((prev) => ({ ...prev, end: e.target.value }))
                }
              />
            </div>
            <button
              onClick={loadSales}
              disabled={!dateRange.start || !dateRange.end || loadingSales}
              className="btn btn-secondary text-sm"
            >
              {loadingSales ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Filter className="h-4 w-4" />
              )}
              Filtrar
            </button>
          </div>
        )}

        {/* Preview dos dados */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">
            Pré-visualização dos dados
          </h3>
          <div className="overflow-x-auto border border-slate-200 rounded-lg max-h-80 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 sticky top-0">
                <tr>
                  {activeTab === "estoque" && (
                    <>
                      <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500">
                        SKU
                      </th>
                      <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500">
                        Nome
                      </th>
                      <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500">
                        Estoque
                      </th>
                      <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500">
                        Preço
                      </th>
                      <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500">
                        Status
                      </th>
                    </>
                  )}
                  {activeTab === "alertas" && (
                    <>
                      <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500">
                        Produto
                      </th>
                      <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500">
                        Estoque
                      </th>
                      <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500">
                        Risco
                      </th>
                      <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500">
                        Severidade
                      </th>
                    </>
                  )}
                  {activeTab === "vendas" && (
                    <>
                      <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500">
                        Data
                      </th>
                      <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500">
                        Produto
                      </th>
                      <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500">
                        Qtd
                      </th>
                      <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500">
                        Total
                      </th>
                    </>
                  )}
                  {activeTab === "forecast" && (
                    <>
                      <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500">
                        Produto
                      </th>
                      <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500">
                        Estoque
                      </th>
                      <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500">
                        Compra Sugerida
                      </th>
                      <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500">
                        Urgência
                      </th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activeTab === "estoque" &&
                  products?.slice(0, 10).map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="px-4 py-2 font-mono text-xs">{p.sku}</td>
                      <td className="px-4 py-2">{p.name}</td>
                      <td className="px-4 py-2">{p.currentStock}</td>
                      <td className="px-4 py-2">
                        R$ {p.unitPrice?.toFixed(2)}
                      </td>
                      <td className="px-4 py-2">
                        <span
                          className={`badge ${p.active ? "badge-success" : "badge-danger"}`}
                        >
                          {p.active ? "Ativo" : "Inativo"}
                        </span>
                      </td>
                    </tr>
                  ))}
                {activeTab === "alertas" &&
                  alerts?.slice(0, 10).map((a) => (
                    <tr key={a.productId} className="hover:bg-slate-50">
                      <td className="px-4 py-2">{a.productName}</td>
                      <td className="px-4 py-2">{a.currentStock}</td>
                      <td className="px-4 py-2">
                        <div className="w-16 h-1.5 bg-gray-200 rounded-full">
                          <div
                            className="h-full bg-red-500 rounded-full"
                            style={{ width: `${a.stockoutRisk}%` }}
                          />
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        <span
                          className={`badge ${
                            a.severity === "ALTO"
                              ? "badge-danger"
                              : a.severity === "MÉDIO"
                                ? "badge-warning"
                                : "badge-info"
                          }`}
                        >
                          {a.severity}
                        </span>
                      </td>
                    </tr>
                  ))}
                {activeTab === "vendas" &&
                  salesData.slice(0, 10).map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50">
                      <td className="px-4 py-2 text-xs">{s.saleDate}</td>
                      <td className="px-4 py-2">{s.product.name}</td>
                      <td className="px-4 py-2">{s.quantity}</td>
                      <td className="px-4 py-2">
                        R$ {s.totalValue?.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                {activeTab === "forecast" &&
                  forecasts?.slice(0, 10).map((f) => (
                    <tr key={f.productId} className="hover:bg-slate-50">
                      <td className="px-4 py-2">{f.productName}</td>
                      <td className="px-4 py-2">{f.currentStock}</td>
                      <td className="px-4 py-2">{f.suggestedOrder}</td>
                      <td className="px-4 py-2">
                        <span
                          className={`badge ${
                            f.urgency === "ALTA"
                              ? "badge-danger"
                              : f.urgency === "MÉDIA"
                                ? "badge-warning"
                                : "badge-success"
                          }`}
                        >
                          {f.urgency}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Mostrando os primeiros 10 registros
          </p>
        </div>

        {/* Botões de exportação */}
        <div className="flex flex-wrap gap-3">
          <ExportButton
            label="Exportar Estoque"
            onExportPDF={() => handleExport(activeTab, "pdf")}
            onExportExcel={() => handleExport(activeTab, "excel")}
          />
        </div>
      </div>
    </div>
  );
}
