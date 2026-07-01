package com.inventory.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SaleRequestDTO {

    @NotNull(message = "ID do produto é obrigatório")
    private Long productId;

    @NotNull(message = "Quantidade é obrigatória")
    @Min(value = 1, message = "Quantidade deve ser pelo menos 1")
    @Max(value = 10000, message = "Quantidade máxima é 10.000")
    private Integer quantity;

    @DecimalMin(value = "0.01", message = "Preço unitário deve ser maior que zero")
    private BigDecimal unitPrice;

    // Para vendas retroativas (útil para carga inicial)
    private String saleDate; // Formato: yyyy-MM-dd
}