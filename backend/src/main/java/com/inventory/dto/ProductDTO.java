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
public class ProductDTO {

    private Long id;

    @NotBlank(message = "SKU é obrigatório")
    @Size(min = 3, max = 50, message = "SKU deve ter entre 3 e 50 caracteres")
    private String sku;

    @NotBlank(message = "Nome é obrigatório")
    @Size(min = 2, max = 200, message = "Nome deve ter entre 2 e 200 caracteres")
    private String name;

    private String category;

    @NotNull(message = "Estoque atual é obrigatório")
    @Min(value = 0, message = "Estoque não pode ser negativo")
    private Integer currentStock;

    @NotNull(message = "Estoque mínimo é obrigatório")
    @Min(value = 0, message = "Estoque mínimo não pode ser negativo")
    private Integer minimumStock;

    @NotNull(message = "Estoque máximo é obrigatório")
    @Min(value = 1, message = "Estoque máximo deve ser pelo menos 1")
    private Integer maximumStock;

    @DecimalMin(value = "0.01", message = "Preço unitário deve ser maior que zero")
    private BigDecimal unitPrice;

    @Min(value = 1, message = "Lead time deve ser pelo menos 1 dia")
    @Max(value = 90, message = "Lead time máximo é 90 dias")
    private Integer leadTimeDays;

    @DecimalMin(value = "0.5", message = "Nível de serviço mínimo é 50%")
    @DecimalMax(value = "1.0", message = "Nível de serviço máximo é 100%")
    private Double serviceLevel;

    private Boolean active;
}