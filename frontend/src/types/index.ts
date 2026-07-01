export interface Product {
  id: number;
  sku: string;
  name: string;
  category: string;
  currentStock: number;
  minimumStock: number;
  maximumStock: number;
  unitPrice: number;
  leadTimeDays: number;
  serviceLevel: number;
  active: boolean;
}

export interface ProductFormData {
  sku: string;
  name: string;
  category: string;
  currentStock: number;
  minimumStock: number;
  maximumStock: number;
  unitPrice: number;
  leadTimeDays: number;
  serviceLevel: number;
}

export interface SaleRecord {
  id: number;
  product: Product;
  quantity: number;
  saleDate: string;
  unitPrice: number;
  totalValue: number;
}

export interface DemandForecast {
  productId: number;
  averageDailyDemand: number;
  safetyStock: number;
  reorderPoint: number;
  currentStock: number;
  suggestedOrder: number;
  stockoutRisk: number;
  daysUntilStockout: number;
}

export interface Alert {
  productId: number;
  productName: string;
  sku: string;
  currentStock: number;
  minimumStock: number;
  reorderPoint: number;
  stockoutRisk: number;
  daysUntilStockout: number;
  severity: 'ALTO' | 'MÉDIO' | 'BAIXO';
  message: string;
  suggestedOrder: number;
}

export interface DashboardData {
  totalProducts: number;
  activeProducts: number;
  productsInAlert: number;
  averageStockLevel: number;
  stockoutRate: number;
  holdingCost: number;
  todaySales: number;
  suggestedOrders: number;
  topSellingProducts: ProductSummary[];
  criticalProducts: ProductSummary[];
  demandTrend: DemandTrend[];
  stockByCategory: CategoryStock[];
}

export interface ProductSummary {
  id: number;
  name: string;
  sku: string;
  currentStock: number;
  soldToday: number;
  stockoutRisk: number;
}

export interface DemandTrend {
  date: string;
  sales: number;
  forecast: number;
}

export interface CategoryStock {
  name: string;
  value: number;
  productCount: number;
}

export interface PurchaseRecommendation {
  productId: number;
  productName: string;
  sku: string;
  currentStock: number;
  suggestedOrder: number;
  stockoutRisk: number;
  urgency: 'ALTA' | 'MÉDIA' | 'BAIXA';
}