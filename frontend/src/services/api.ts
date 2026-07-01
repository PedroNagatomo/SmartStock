import axios from 'axios';
import type {
  Product,
  ProductFormData,
  DemandForecast,
  Alert,
  DashboardData,
  PurchaseRecommendation,
  SaleRecord,
} from '../types';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para logs
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`);
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('❌ API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const productService = {
  getAll: (category?: string, search?: string) => {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (search) params.append('search', search);
    return api.get<Product[]>(`/products?${params}`);
  },

  getById: (id: number) => api.get<Product>(`/products/${id}`),

  getBySku: (sku: string) => api.get<Product>(`/products/sku/${sku}`),

  create: (data: ProductFormData) => api.post<Product>('/products', data),

  update: (id: number, data: Partial<Product>) =>
    api.put<Product>(`/products/${id}`, data),

  updateStock: (id: number, quantity: number) =>
    api.patch<Product>(`/products/${id}/stock?quantity=${quantity}`),

  deactivate: (id: number) => api.delete(`/products/${id}`),
};

export const salesService = {
  record: (productId: number, quantity: number, unitPrice?: number) =>
    api.post('/sales', { productId, quantity, unitPrice }),

  getHistory: (productId: number, startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return api.get<SaleRecord[]>(`/sales/product/${productId}?${params}`);
  },

  getTodaySales: () => api.get('/sales/today'),
};

export const forecastService = {
  getForProduct: (productId: number) =>
    api.get<DemandForecast>(`/forecast/${productId}`),

  getAll: () => api.get('/forecast/all'),

  getRecommendations: () =>
    api.get<PurchaseRecommendation[]>('/forecast/recommendations'),
};

export const alertService = {
  getAll: (severity?: string) => {
    const params = severity ? `?severity=${severity}` : '';
    return api.get<Alert[]>(`/alerts${params}`);
  },

  getCritical: () => api.get<Alert[]>('/alerts/critical'),

  getCounts: () => api.get('/alerts/count'),
};

export const dashboardService = {
  getData: (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return api.get<DashboardData>(`/dashboard?${params}`);
  },
};

export default api;