package com.inventory.controller;

import com.inventory.dto.DashboardDTO;
import com.inventory.model.Product;
import com.inventory.model.User;
import com.inventory.repository.ProductRepository;
import com.inventory.repository.SaleRecordRepository;
import com.inventory.security.CurrentUser;
import com.inventory.service.DemandForecast;
import com.inventory.service.DemandForecastService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@Tag(name = "Dashboard", description = "Dados consolidados para o dashboard")
@CrossOrigin(origins = "*")
public class DashboardController {

    private final ProductRepository productRepository;
    private final SaleRecordRepository saleRecordRepository;
    private final DemandForecastService forecastService;
    private final CurrentUser currentUser;

    @GetMapping
    @Operation(summary = "Dados completos do dashboard")
    public ResponseEntity<DashboardDTO> getDashboardData(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {

        User current = currentUser.get();
        LocalDate start = startDate != null ?
                LocalDate.parse(startDate, DateTimeFormatter.ISO_DATE) :
                LocalDate.now().minusDays(30);

        LocalDate end = endDate != null ?
                LocalDate.parse(endDate, DateTimeFormatter.ISO_DATE) :
                LocalDate.now();

        List<Product> activeProducts = productRepository.findByUserAndActiveTrue(current);
        long totalProducts = activeProducts.size();

        // Estatísticas básicas
        double avgStock = activeProducts.stream()
                .mapToInt(Product::getCurrentStock)
                .average()
                .orElse(0);

        // Produtos em alerta
        long productsInAlert = activeProducts.stream()
                .map(forecastService::forecastDemand)
                .filter(f -> f.getStockoutRisk() > 50)
                .count();

        // Taxa de ruptura (produtos com estoque zero)
        double stockoutRate = activeProducts.isEmpty() ? 0 :
                (double) activeProducts.stream()
                        .filter(p -> p.getCurrentStock() == 0)
                        .count() / activeProducts.size() * 100;

        // Custo de holding estimado (25% do valor do estoque ao ano)
        double totalStockValue = activeProducts.stream()
                .filter(p -> p.getUnitPrice() != null)
                .mapToDouble(p -> p.getCurrentStock() * p.getUnitPrice().doubleValue())
                .sum();
        double holdingCost = totalStockValue * 0.25;

        // Vendas do dia
        int todaySales = 0;
        for (Product product : activeProducts) {
            Integer dailySales = saleRecordRepository
                    .getTotalSales(product.getId(), LocalDate.now(), LocalDate.now());
            if (dailySales != null) todaySales += dailySales;
        }

        // Compras sugeridas
        int suggestedOrders = (int) activeProducts.stream()
                .map(forecastService::forecastDemand)
                .filter(f -> f.getSuggestedOrder() > 0)
                .count();

        // Top 5 produtos mais vendidos
        List<DashboardDTO.ProductSummaryDTO> topSelling = getTopSellingProducts(activeProducts, start, end);

        // Produtos críticos
        List<DashboardDTO.ProductSummaryDTO> criticalProducts = getCriticalProducts(activeProducts);

        // Tendência de demanda
        List<DashboardDTO.DemandTrendDTO> demandTrend = getDemandTrend(activeProducts, start, end);

        // Estoque por categoria
        List<DashboardDTO.CategoryStockDTO> stockByCategory = getStockByCategory(activeProducts);

        DashboardDTO dashboard = DashboardDTO.builder()
                .totalProducts(totalProducts)
                .activeProducts(activeProducts.size())
                .productsInAlert(productsInAlert)
                .averageStockLevel(avgStock)
                .stockoutRate(stockoutRate)
                .holdingCost(holdingCost)
                .todaySales(todaySales)
                .suggestedOrders(suggestedOrders)
                .topSellingProducts(topSelling)
                .criticalProducts(criticalProducts)
                .demandTrend(demandTrend)
                .stockByCategory(stockByCategory)
                .build();

        return ResponseEntity.ok(dashboard);
    }

    private List<DashboardDTO.ProductSummaryDTO> getTopSellingProducts(
            List<Product> activeProducts, LocalDate start, LocalDate end) {

        return activeProducts.stream()
                .map(product -> {
                    Integer totalSold = saleRecordRepository
                            .getTotalSales(product.getId(), start, end);
                    return DashboardDTO.ProductSummaryDTO.builder()
                            .id(product.getId())
                            .name(product.getName())
                            .sku(product.getSku())
                            .currentStock(product.getCurrentStock())
                            .soldToday(totalSold != null ? totalSold : 0)
                            .stockoutRisk(0.0)
                            .build();
                })
                .filter(p -> p.getSoldToday() > 0)
                .sorted((a, b) -> b.getSoldToday().compareTo(a.getSoldToday()))
                .limit(5)
                .collect(Collectors.toList());
    }

    private List<DashboardDTO.ProductSummaryDTO> getCriticalProducts(List<Product> activeProducts) {
        return activeProducts.stream()
                .map(product -> {
                    DemandForecast forecast = forecastService.forecastDemand(product);
                    return DashboardDTO.ProductSummaryDTO.builder()
                            .id(product.getId())
                            .name(product.getName())
                            .sku(product.getSku())
                            .currentStock(product.getCurrentStock())
                            .soldToday(0)
                            .stockoutRisk(forecast.getStockoutRisk())
                            .build();
                })
                .filter(p -> p.getStockoutRisk() > 50)
                .sorted((a, b) -> b.getStockoutRisk().compareTo(a.getStockoutRisk()))
                .limit(10)
                .collect(Collectors.toList());
    }

    private List<DashboardDTO.DemandTrendDTO> getDemandTrend(
            List<Product> activeProducts, LocalDate start, LocalDate end) {

        List<DashboardDTO.DemandTrendDTO> trend = new ArrayList<>();
        for (LocalDate date = start; !date.isAfter(end); date = date.plusDays(1)) {
            int daySales = 0;
            for (Product product : activeProducts) {
                Integer sales = saleRecordRepository
                        .getTotalSales(product.getId(), date, date);
                if (sales != null) daySales += sales;
            }
            trend.add(DashboardDTO.DemandTrendDTO.builder()
                    .date(date.format(DateTimeFormatter.ISO_DATE))
                    .sales(daySales)
                    .forecast(daySales + (int)(Math.random() * 5))
                    .build());
        }
        return trend;
    }

    private List<DashboardDTO.CategoryStockDTO> getStockByCategory(List<Product> activeProducts) {
        Map<String, List<Product>> byCategory = activeProducts.stream()
                .collect(Collectors.groupingBy(
                        p -> p.getCategory() != null ? p.getCategory() : "Sem categoria"));
        return byCategory.entrySet().stream()
                .map(entry -> DashboardDTO.CategoryStockDTO.builder()
                        .name(entry.getKey())
                        .value(entry.getValue().stream().mapToInt(Product::getCurrentStock).sum())
                        .productCount(entry.getValue().size())
                        .build())
                .sorted((a, b) -> Double.compare(b.getValue(), a.getValue()))
                .collect(Collectors.toList());
    }
}