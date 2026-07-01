import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

export const formatDate = (date: string, pattern: string = "dd/MM/yyyy"): string => {
  try {
    return format(parseISO(date), pattern, { locale: ptBR });
  } catch {
    return date;
  }
};

export const getSeverityColor = (severity: string): string => {
  switch (severity) {
    case "ALTO":
      return "bg-red-100 text-red-800";
    case "MÉDIO":
      return "bg-yellow-100 text-yellow-800";
    case "BAIXO":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export const getRiskColor = (risk: number): string => {
  if (risk > 75) return "bg-red-600";
  if (risk > 50) return "bg-yellow-500";
  if (risk > 25) return "bg-orange-400";
  return "bg-green-500";
};