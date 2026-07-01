package com.inventory.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AlertDTO {
    private Long productId;
    private String productName;
    private String sku;
    private Integer currentStock;
    private Integer minimumStock;
    private Integer reorderPoint;
    private Double stockoutRisk;
    private Integer daysUntilStockout;
    private String severity; // ALTO, MÉDIO, BAIXO
    private String message;
    private Integer suggestedOrder;
}