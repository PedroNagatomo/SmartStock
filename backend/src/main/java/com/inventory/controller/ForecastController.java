package com.inventory.controller;

import com.inventory.model.Product;
import com.inventory.model.User;
import com.inventory.repository.ProductRepository;
import com.inventory.security.CurrentUser;
import com.inventory.service.DemandForecast;
import com.inventory.service.DemandForecastService;
import com.inventory.exception.ResourceNotFoundException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/forecast")
@RequiredArgsConstructor
@Tag(name = "Previsão", description = "Previsão de demanda e recomendações de compra")
@CrossOrigin(origins = "*")
public class ForecastController {

    private final DemandForecastService forecastService;
    private final ProductRepository productRepository;
    private final CurrentUser currentUser;

    @GetMapping("/{productId}")
    @Operation(summary = "Previsão de demanda para um produto específico")
    public ResponseEntity<DemandForecast> getProductForecast(@PathVariable Long productId) {
        User current = currentUser.get();
        Product product = productRepository.findByUserAndId(current, productId)
                .orElseThrow(() -> new ResourceNotFoundException("Produto", "id", productId));

        DemandForecast forecast = forecastService.forecastDemand(product);
        return ResponseEntity.ok(forecast);
    }

    @GetMapping("/all")
    @Operation(summary = "Previsão para todos os produtos ativos")
    public ResponseEntity<List<Map<String, Object>>> getAllForecasts() {
        User current = currentUser.get();
        List<Product> activeProducts = productRepository.findByUserAndActiveTrue(current);

        List<Map<String, Object>> forecasts = activeProducts.stream()
                .map(product -> {
                    DemandForecast forecast = forecastService.forecastDemand(product);
                    Map<String, Object> map = new HashMap<>();
                    map.put("productId", product.getId());
                    map.put("productName", product.getName());
                    map.put("sku", product.getSku());
                    map.put("currentStock", forecast.getCurrentStock());
                    map.put("averageDailyDemand", forecast.getAverageDailyDemand());
                    map.put("safetyStock", forecast.getSafetyStock());
                    map.put("reorderPoint", forecast.getReorderPoint());
                    map.put("suggestedOrder", forecast.getSuggestedOrder());
                    map.put("stockoutRisk", forecast.getStockoutRisk());
                    map.put("daysUntilStockout", forecast.getDaysUntilStockout());
                    map.put("needsReorder", forecast.getCurrentStock() <= forecast.getReorderPoint());
                    return map;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(forecasts);
    }

    @GetMapping("/recommendations")
    @Operation(summary = "Recomendações de compra (produtos que precisam ser repostos)")
    public ResponseEntity<List<Map<String, Object>>> getPurchaseRecommendations() {
        User current = currentUser.get();
        List<Product> activeProducts = productRepository.findByUserAndActiveTrue(current);

        List<Map<String, Object>> recommendations = activeProducts.stream()
                .map(product -> forecastService.forecastDemand(product))
                .filter(forecast -> forecast.getSuggestedOrder() > 0)
                .map(forecast -> {
                    Product product = productRepository.findById(forecast.getProductId()).orElse(null);
                    Map<String, Object> rec = new HashMap<>();
                    rec.put("productId", forecast.getProductId());
                    rec.put("productName", product != null ? product.getName() : "N/A");
                    rec.put("sku", product != null ? product.getSku() : "N/A");
                    rec.put("currentStock", forecast.getCurrentStock());
                    rec.put("suggestedOrder", forecast.getSuggestedOrder());
                    rec.put("stockoutRisk", forecast.getStockoutRisk());
                    rec.put("urgency", forecast.getStockoutRisk() > 75 ? "ALTA" :
                            forecast.getStockoutRisk() > 50 ? "MÉDIA" : "BAIXA");
                    return rec;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(recommendations);
    }
}