package com.inventory.service;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DemandForecast {
    private Long productId;
    private double averageDailyDemand;
    private int safetyStock;
    private int reorderPoint;
    private int currentStock;
    private int suggestedOrder;
    private double stockoutRisk;
    private int daysUntilStockout;
}