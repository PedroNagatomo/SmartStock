package com.inventory.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardDTO {

    private long totalProducts;
    private long activeProducts;
    private long productsInAlert;
    private double averageStockLevel;
    private double stockoutRate;
    private double holdingCost;
    private int todaySales;
    private int suggestedOrders;

    private List<ProductSummaryDTO> topSellingProducts;
    private List<ProductSummaryDTO> criticalProducts;
    private List<DemandTrendDTO> demandTrend;
    private List<CategoryStockDTO> stockByCategory;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProductSummaryDTO {
        private Long id;
        private String name;
        private String sku;
        private Integer currentStock;
        private Integer soldToday;
        private Double stockoutRisk;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DemandTrendDTO {
        private String date;
        private int sales;
        private int forecast;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategoryStockDTO {
        private String name;
        private double value;
        private int productCount;
    }
}