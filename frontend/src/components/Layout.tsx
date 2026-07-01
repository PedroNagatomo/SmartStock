import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  AlertTriangle,
  TrendingUp,
  ShoppingCart,
  BarChart3,
  Bell,
  Menu,
  X,
  Search,
  ChevronDown,
  Scan,
  LogOut,
} from "lucide-react";
import { useAlertCounts } from "../hooks/useApi";
import NetworkStatus from "./NetworkStatus";
import { useAuth } from "../context/AuthContext";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Produtos", href: "/products", icon: Package },
  { name: "Escanear", href: "/scan", icon: Scan },
  { name: "Vendas", href: "/sales", icon: TrendingUp },
  { name: "Alertas", href: "/alerts", icon: AlertTriangle },
  { name: "Compras", href: "/purchases", icon: ShoppingCart },
  { name: "Relatórios", href: "/reports", icon: BarChart3 },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { data: alertCounts } = useAlertCounts();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Obtém as iniciais para o avatar
  const userInitial = user
    ? (user.fullName?.charAt(0) || user.username.charAt(0)).toUpperCase()
    : "?";

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200
          transform transition-transform duration-300 ease-in-out
          lg:relative lg:translate-x-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 h-16 px-6 border-b border-slate-100">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/20">
            <Package className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800">SmartStock</h1>
            <p className="text-xs text-slate-400">Gestão Inteligente</p>
          </div>
          <button
            className="ml-auto lg:hidden text-slate-400 hover:text-slate-600"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-3 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`nav-link ${isActive ? "active" : ""}`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon
                  className={`h-5 w-5 ${isActive ? "text-blue-600" : "text-slate-400"}`}
                />
                <span>{item.name}</span>
                {item.name === "Alertas" &&
                  (alertCounts?.critical ?? 0) > 0 && (
                    <span className="ml-auto px-2 py-0.5 text-xs font-bold rounded-full bg-red-500 text-white animate-fade-in">
                      {alertCounts.critical}
                    </span>
                  )}
              </Link>
            );
          })}
        </nav>

        {/* User footer */}
        {user && (
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-100">
            <div
              className="flex items-center gap-3 px-2 py-2 cursor-pointer hover:bg-slate-100 rounded-lg transition-colors"
              onClick={() => navigate("/profile")}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-sm font-medium">
                {userInitial}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-700 truncate">
                  {user.fullName || user.username}
                </p>
                <p className="text-xs text-slate-400 truncate">{user.email}</p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  logout();
                }}
                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Sair"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30">
          <div className="flex items-center justify-between h-16 px-4 lg:px-8">
            <div className="flex items-center gap-3">
              <button
                className="lg:hidden p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </button>
              {/* Breadcrumb dinâmico */}
              <div className="hidden sm:flex items-center gap-2 text-sm">
                <span className="text-slate-400">SmartStock</span>
                <ChevronDown className="h-3 w-3 text-slate-400 rotate-270" />
                <span className="font-medium text-slate-700">
                  {navigation.find((n) => n.href === location.pathname)?.name ||
                    "Página"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="hidden md:flex items-center">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Buscar..."
                    className="input pl-10 py-2 w-64 text-sm"
                  />
                </div>
              </div>

              {/* Notifications */}
              <button className="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                <Bell className="h-5 w-5" />
                {alertCounts?.critical > 0 && (
                  <>
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-xs text-white font-bold animate-pulse">
                      {alertCounts.critical}
                    </span>
                  </>
                )}
              </button>

              {/* User avatar - agora clicável */}
              <div
                onClick={() => navigate("/profile")}
                className="hidden sm:flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 text-white text-sm font-medium cursor-pointer ring-2 ring-white shadow-sm hover:scale-105 transition-transform"
                title="Meu Perfil"
              >
                {userInitial}
              </div>
            </div>
          </div>
        </header>

        <NetworkStatus />

        {/* Page content with animation */}
        <main className="flex-1 overflow-y-auto p-6 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}