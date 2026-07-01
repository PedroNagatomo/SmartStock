import { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import {
  AlertTriangle,
  Package,
  TrendingUp,
  ShoppingCart,
  DollarSign,
  RefreshCw,
  TrendingDown,
  Zap,
} from "lucide-react";

import { useDashboard } from "../hooks/useApi";
import { formatCurrency } from "../utils/format";

const COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
];

export default function DashboardPage() {
  const [dateRange, setDateRange] = useState("30");
  const { data: dashboard, isLoading, refetch } = useDashboard();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500">Carregando dados...</p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: "Produtos em Risco",
      value: dashboard?.productsInAlert || 0,
      icon: AlertTriangle,
      gradient: "from-red-500 to-rose-500",
      bgGradient: "from-red-50 to-rose-50",
      textColor: "text-red-700",
      trend: "+5% vs. ontem",
      trendBad: true,
    },
    {
      title: "Total de Produtos",
      value: dashboard?.activeProducts || 0,
      icon: Package,
      gradient: "from-blue-500 to-indigo-500",
      bgGradient: "from-blue-50 to-indigo-50",
      textColor: "text-blue-700",
      trend: "Estável",
      trendBad: false,
    },
    {
      title: "Vendas Hoje",
      value: dashboard?.todaySales || 0,
      icon: TrendingUp,
      gradient: "from-emerald-500 to-green-500",
      bgGradient: "from-emerald-50 to-green-50",
      textColor: "text-emerald-700",
      trend: "+12% vs. ontem",
      trendBad: false,
    },
    {
      title: "Compras Sugeridas",
      value: dashboard?.suggestedOrders || 0,
      icon: ShoppingCart,
      gradient: "from-violet-500 to-purple-500",
      bgGradient: "from-violet-50 to-purple-50",
      textColor: "text-violet-700",
      trend: "3 urgentes",
      trendBad: true,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Visão geral do seu negócio
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            className="input w-32 py-2 text-sm"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option value="7">7 dias</option>
            <option value="30">30 dias</option>
            <option value="90">90 dias</option>
          </select>
          <button
            onClick={() => refetch()}
            className="btn btn-secondary text-sm"
          >
            <RefreshCw className="h-4 w-4" />
            Atualizar
          </button>
        </div>
      </div>{" "}
      {/* Fim da div do header */}
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="relative overflow-hidden rounded-xl bg-white border border-slate-200 p-5 shadow-sm hover:shadow-lg transition-all duration-300 group animate-fade-in"
            style={{ animationDelay: `${idx * 100}ms` }}
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className={`p-2.5 rounded-xl bg-gradient-to-br ${stat.bgGradient}`}
              >
                <stat.icon className={`h-5 w-5 ${stat.textColor}`} />
              </div>
              <span
                className={`text-xs font-medium px-2 py-1 rounded-full ${
                  stat.trendBad
                    ? "bg-red-50 text-red-600"
                    : "bg-emerald-50 text-emerald-600"
                }`}
              >
                {stat.trend}
              </span>
            </div>
            <div>
              <p className="text-3xl font-bold text-slate-800 tracking-tight">
                {stat.value}
              </p>
              <p className="text-sm text-slate-500 mt-1">{stat.title}</p>
            </div>
            {/* Decorative gradient blob */}
            <div
              className={`absolute -bottom-6 -right-6 w-24 h-24 bg-gradient-to-br ${stat.gradient} opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity`}
            />
          </div>
        ))}
      </div>
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tendência de Demanda - Area Chart */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-800">
                Tendência de Vendas
              </h2>
              <p className="text-sm text-slate-500">Últimos {dateRange} dias</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-xs text-slate-500">Realizado</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-xs text-slate-500">Previsto</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={dashboard?.demandTrend || []}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "none",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                  fontSize: "13px",
                }}
              />
              <Area
                type="monotone"
                dataKey="sales"
                stroke="#3b82f6"
                strokeWidth={2}
                fill="url(#colorSales)"
                name="Vendas"
                dot={false}
                activeDot={{ r: 4, strokeWidth: 2 }}
              />
              <Area
                type="monotone"
                dataKey="forecast"
                stroke="#10b981"
                strokeWidth={2}
                strokeDasharray="5 5"
                fill="none"
                name="Previsão"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Estoque por Categoria - Donut Chart */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-800">
                Distribuição por Categoria
              </h2>
              <p className="text-sm text-slate-500">Unidades em estoque</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={dashboard?.stockByCategory || []}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={110}
                paddingAngle={4}
                dataKey="value"
                nameKey="name"
              >
                {(dashboard?.stockByCategory || []).map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                    stroke="none"
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "none",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                }}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                formatter={(value) => (
                  <span className="text-sm text-slate-600">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      {/* Produtos Críticos & Top Vendedores */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Críticos */}
        <div className="card p-0 overflow-hidden">
          <div className="px-6 pt-6 pb-4 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800">
                🚨 Produtos Críticos
              </h2>
              <span className="badge badge-danger">
                {dashboard?.criticalProducts?.length || 0}
              </span>
            </div>
          </div>
          <div className="p-6 space-y-3 max-h-80 overflow-y-auto">
            {dashboard?.criticalProducts?.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between p-3 rounded-xl bg-red-50/50 border border-red-100 hover:bg-red-50 transition-colors"
              >
                <div>
                  <p className="font-medium text-slate-800 text-sm">
                    {product.name}
                  </p>
                  <p className="text-xs text-slate-500">SKU: {product.sku}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-red-600">
                    Estoque: {product.currentStock}
                  </p>
                  <div className="w-24 h-1.5 bg-red-100 rounded-full mt-1.5 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-red-400 to-red-600 rounded-full transition-all"
                      style={{ width: `${product.stockoutRisk}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
            {(!dashboard?.criticalProducts ||
              dashboard.criticalProducts.length === 0) && (
              <p className="text-center text-slate-400 py-4 text-sm">
                Nenhum produto crítico 🎉
              </p>
            )}
          </div>
        </div>

        {/* Top Vendedores */}
        <div className="card p-0 overflow-hidden">
          <div className="px-6 pt-6 pb-4 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800">
                ⭐ Mais Vendidos Hoje
              </h2>
              <Zap className="h-4 w-4 text-amber-500" />
            </div>
          </div>
          <div className="p-6 space-y-2 max-h-80 overflow-y-auto">
            {dashboard?.topSellingProducts?.map((product, idx) => (
              <div
                key={product.id}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-700 font-bold text-sm">
                    {idx + 1}
                  </div>
                  <div>
                    <p className="font-medium text-slate-800 text-sm">
                      {product.name}
                    </p>
                    <p className="text-xs text-slate-500">{product.sku}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-slate-800 text-sm">
                    {product.soldToday} unid.
                  </p>
                  <p className="text-xs text-slate-400">hoje</p>
                </div>
              </div>
            ))}
            {(!dashboard?.topSellingProducts ||
              dashboard.topSellingProducts.length === 0) && (
              <p className="text-center text-slate-400 py-4 text-sm">
                Nenhuma venda hoje
              </p>
            )}
          </div>
        </div>
      </div>
      {/* Métricas de Custo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-white p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-amber-50">
              <DollarSign className="h-5 w-5 text-amber-600" />
            </div>
            <span className="text-sm font-medium text-slate-600">
              Custo de Holding Anual
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-800">
            {formatCurrency(dashboard?.holdingCost || 0)}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Estimativa baseada em 25% do valor do estoque
          </p>
        </div>
        <div className="card bg-white p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-red-50">
              <TrendingDown className="h-5 w-5 text-red-600" />
            </div>
            <span className="text-sm font-medium text-slate-600">
              Taxa de Ruptura
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-800">
            {dashboard?.stockoutRate?.toFixed(1)}%
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Produtos com estoque zerado
          </p>
        </div>
        <div className="card bg-white p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-blue-50">
              <Package className="h-5 w-5 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-slate-600">
              Estoque Médio
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-800">
            {dashboard?.averageStockLevel?.toFixed(0)} unid.
          </p>
          <p className="text-xs text-slate-400 mt-1">Por produto ativo</p>
        </div>
      </div>
    </div>
  );
}
