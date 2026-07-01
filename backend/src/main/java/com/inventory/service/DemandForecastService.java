package com.inventory.service;

import com.inventory.model.Product;
import com.inventory.model.SaleRecord;
import com.inventory.repository.SaleRecordRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DemandForecastService {

    private final SaleRecordRepository saleRecordRepository;

    /**
     * Calcula a previsão de demanda usando média móvel ponderada com ajuste sazonal
     */
    public DemandForecast forecastDemand(Product product) {
        // Usar 90 dias de histórico
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(90);

        List<SaleRecord> salesHistory = saleRecordRepository
                .findByProductIdAndSaleDateBetweenOrderBySaleDateAsc(
                        product.getId(), startDate, endDate);

        if (salesHistory.isEmpty()) {
            return createDefaultForecast(product);
        }

        // Calcular média móvel ponderada (pesos maiores para dados recentes)
        double weightedAverage = calculateWeightedMovingAverage(salesHistory);

        // Aplicar ajuste sazonal
        double seasonalFactor = calculateSeasonalFactor(salesHistory);
        double adjustedDemand = weightedAverage * seasonalFactor;

        // Calcular estoque de segurança
        int safetyStock = calculateSafetyStock(salesHistory, product.getServiceLevel(),
                product.getLeadTimeDays());

        // Ponto de reposição
        int reorderPoint = (int) Math.ceil(adjustedDemand * product.getLeadTimeDays()) + safetyStock;

        // Quantidade sugerida de compra
        int suggestedOrder = calculateSuggestedOrder(adjustedDemand, product, safetyStock);

        return DemandForecast.builder()
                .productId(product.getId())
                .averageDailyDemand(adjustedDemand)
                .safetyStock(safetyStock)
                .reorderPoint(reorderPoint)
                .currentStock(product.getCurrentStock())
                .suggestedOrder(suggestedOrder)
                .stockoutRisk(calculateStockoutRisk(product, adjustedDemand))
                .daysUntilStockout(calculateDaysUntilStockout(product, adjustedDemand))
                .build();
    }

    /**
     * Média Móvel Ponderada - dá mais peso aos dados recentes
     */
    private double calculateWeightedMovingAverage(List<SaleRecord> sales) {
        // Agrupar vendas por dia
        Map<LocalDate, Integer> dailySales = sales.stream()
                .collect(Collectors.groupingBy(
                        SaleRecord::getSaleDate,
                        Collectors.summingInt(SaleRecord::getQuantity)
                ));

        List<LocalDate> dates = new ArrayList<>(dailySales.keySet());
        Collections.sort(dates);

        if (dates.size() < 2) {
            return sales.stream().mapToInt(SaleRecord::getQuantity).average().orElse(0);
        }

        // Últimos 30 dias com peso exponencial
        double weightedSum = 0;
        double weightSum = 0;
        LocalDate latest = dates.get(dates.size() - 1);

        for (int i = dates.size() - 1; i >= 0; i--) {
            LocalDate date = dates.get(i);
            long daysAgo = ChronoUnit.DAYS.between(date, latest);

            // Peso diminui exponencialmente (fator de decaimento 0.9)
            double weight = Math.pow(0.9, daysAgo);
            weightedSum += dailySales.get(date) * weight;
            weightSum += weight;
        }

        return weightSum > 0 ? weightedSum / weightSum : 0;
    }

    /**
     * Fator sazonal simples - compara vendas recentes com média de longo prazo
     */
    private double calculateSeasonalFactor(List<SaleRecord> sales) {
        LocalDate now = LocalDate.now();

        // Vendas nas últimas 2 semanas
        double recentSales = sales.stream()
                .filter(s -> ChronoUnit.DAYS.between(s.getSaleDate(), now) <= 14)
                .mapToInt(SaleRecord::getQuantity)
                .average()
                .orElse(1);

        // Média geral
        double overallAverage = sales.stream()
                .mapToInt(SaleRecord::getQuantity)
                .average()
                .orElse(1);

        return overallAverage > 0 ? recentSales / overallAverage : 1.0;
    }

    /**
     * Estoque de segurança baseado no desvio padrão da demanda
     */
    private int calculateSafetyStock(List<SaleRecord> sales, Double serviceLevel,
                                     Integer leadTimeDays) {
        if (serviceLevel == null) serviceLevel = 0.9;
        if (leadTimeDays == null) leadTimeDays = 7;

        // Calcular desvio padrão da demanda diária
        Map<LocalDate, Integer> dailySales = sales.stream()
                .collect(Collectors.groupingBy(
                        SaleRecord::getSaleDate,
                        Collectors.summingInt(SaleRecord::getQuantity)
                ));

        double mean = dailySales.values().stream()
                .mapToInt(Integer::intValue)
                .average()
                .orElse(0);

        double variance = dailySales.values().stream()
                .mapToDouble(v -> Math.pow(v - mean, 2))
                .average()
                .orElse(0);

        double stdDev = Math.sqrt(variance);

        // Z-score para o nível de serviço (aproximação)
        double zScore = getZScore(serviceLevel);

        return (int) Math.ceil(zScore * stdDev * Math.sqrt(leadTimeDays));
    }

    /**
     * Tabela Z-score simplificada
     */
    private double getZScore(double serviceLevel) {
        if (serviceLevel >= 0.99) return 2.33;
        if (serviceLevel >= 0.95) return 1.65;
        if (serviceLevel >= 0.90) return 1.28;
        if (serviceLevel >= 0.85) return 1.04;
        if (serviceLevel >= 0.80) return 0.84;
        return 0.67; // 75%
    }

    /**
     * Quantidade sugerida de compra (EOQ simplificado)
     */
    private int calculateSuggestedOrder(double dailyDemand, Product product, int safetyStock) {
        int currentStock = product.getCurrentStock();
        int reorderPoint = (int) Math.ceil(dailyDemand * product.getLeadTimeDays()) + safetyStock;

        if (currentStock > reorderPoint) {
            return 0; // Não precisa comprar ainda
        }

        // Sugerir compra para cobrir lead time + estoque de segurança + 1 semana extra
        int targetStock = (int) Math.ceil(dailyDemand * (product.getLeadTimeDays() + 7)) + safetyStock;
        return Math.max(0, targetStock - currentStock);
    }

    /**
     * Risco de ruptura em porcentagem
     */
    private double calculateStockoutRisk(Product product, double dailyDemand) {
        if (dailyDemand == 0) return 0;

        int currentStock = product.getCurrentStock();
        int leadTimeDays = product.getLeadTimeDays() != null ? product.getLeadTimeDays() : 7;

        double demandDuringLeadTime = dailyDemand * leadTimeDays;

        if (currentStock >= demandDuringLeadTime * 1.5) return 0;
        if (currentStock >= demandDuringLeadTime) return 25;
        if (currentStock >= demandDuringLeadTime * 0.5) return 50;
        if (currentStock > 0) return 75;
        return 100;
    }

    /**
     * Dias estimados até ruptura
     */
    private int calculateDaysUntilStockout(Product product, double dailyDemand) {
        if (dailyDemand == 0) return 999;
        return (int) (product.getCurrentStock() / dailyDemand);
    }

    private DemandForecast createDefaultForecast(Product product) {
        return DemandForecast.builder()
                .productId(product.getId())
                .averageDailyDemand(0)
                .safetyStock(product.getMinimumStock())
                .reorderPoint(product.getMinimumStock())
                .currentStock(product.getCurrentStock())
                .suggestedOrder(0)
                .stockoutRisk(0)
                .daysUntilStockout(999)
                .build();
    }
}