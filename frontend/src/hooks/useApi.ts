import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  productService,
  salesService,
  forecastService,
  alertService,
  dashboardService,
} from "../services/api";
import type { ProductFormData } from "../types";

// Query hooks
export const useProducts = (category?: string, search?: string) => {
  return useQuery({
    queryKey: ["products", category, search],
    queryFn: () => productService.getAll(category, search).then((res) => res.data),
    staleTime: 30000,
    refetchInterval: 60000,
  });
};

export const useProduct = (id: number) => {
  return useQuery({
    queryKey: ["product", id],
    queryFn: () => productService.getById(id).then((res) => res.data),
    enabled: !!id,
  });
};

export const useForecast = (productId: number) => {
  return useQuery({
    queryKey: ["forecast", productId],
    queryFn: () => forecastService.getForProduct(productId).then((res) => res.data),
    enabled: !!productId,
    refetchInterval: 300000,
  });
};

export const useRecommendations = () => {
  return useQuery({
    queryKey: ["recommendations"],
    queryFn: () => forecastService.getRecommendations().then((res) => res.data),
    refetchInterval: 300000,
  });
};

export const useAlerts = (severity?: string) => {
  return useQuery({
    queryKey: ["alerts", severity],
    queryFn: () => alertService.getAll(severity).then((res) => res.data),
    refetchInterval: 60000,
  });
};

export const useAlertCounts = () => {
  return useQuery({
    queryKey: ["alertCounts"],
    queryFn: () => alertService.getCounts().then((res) => res.data),
    refetchInterval: 30000,
  });
};

export const useDashboard = (startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ["dashboard", startDate, endDate],
    queryFn: () =>
      dashboardService.getData(startDate, endDate).then((res) => res.data),
    refetchInterval: 60000,
  });
};

// Mutation hooks
export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ProductFormData) =>
      productService.create(data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: Partial<ProductFormData>;
    }) => productService.update(id, data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
};

export const useUpdateStock = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, quantity }: { id: number; quantity: number }) =>
      productService.updateStock(id, quantity).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
    },
  });
};

export const useRecordSale = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      productId,
      quantity,
      unitPrice,
    }: {
      productId: number;
      quantity: number;
      unitPrice?: number;
    }) =>
      salesService.record(productId, quantity, unitPrice).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["forecast"] });
    },
  });
};