package com.inventory.controller;

import com.inventory.dto.AlertDTO;
import com.inventory.model.Product;
import com.inventory.model.User;
import com.inventory.repository.ProductRepository;
import com.inventory.security.CurrentUser;
import com.inventory.service.DemandForecast;
import com.inventory.service.DemandForecastService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/alerts")
@RequiredArgsConstructor
@Tag(name = "Alertas", description = "Alertas de estoque crítico")
@CrossOrigin(origins = "*")
public class AlertController {

    private final DemandForecastService forecastService;
    private final ProductRepository productRepository;
    private final CurrentUser currentUser;

    @GetMapping
    @Operation(summary = "Listar todos os alertas de estoque")
    public ResponseEntity<List<AlertDTO>> getAlerts(
            @RequestParam(required = false) String severity) {

        User current = currentUser.get();
        List<Product> activeProducts = productRepository.findByUserAndActiveTrue(current);
        List<AlertDTO> alerts = new ArrayList<>();

        for (Product product : activeProducts) {
            DemandForecast forecast = forecastService.forecastDemand(product);

            if (forecast.getStockoutRisk() > 0 ||
                    forecast.getCurrentStock() <= forecast.getReorderPoint()) {

                String alertSeverity;
                String message;
                if (forecast.getStockoutRisk() > 75) {
                    alertSeverity = "ALTO";
                    message = "Risco crítico de ruptura! Ação imediata necessária.";
                } else if (forecast.getStockoutRisk() > 50) {
                    alertSeverity = "MÉDIO";
                    message = "Estoque baixo. Recomenda-se reposição em até 48h.";
                } else if (forecast.getCurrentStock() <= forecast.getReorderPoint()) {
                    alertSeverity = "BAIXO";
                    message = "Próximo ao ponto de reposição. Planejar compra.";
                } else {
                    continue;
                }

                AlertDTO alert = AlertDTO.builder()
                        .productId(product.getId())
                        .productName(product.getName())
                        .sku(product.getSku())
                        .currentStock(forecast.getCurrentStock())
                        .minimumStock(product.getMinimumStock())
                        .reorderPoint(forecast.getReorderPoint())
                        .stockoutRisk(forecast.getStockoutRisk())
                        .daysUntilStockout(forecast.getDaysUntilStockout())
                        .severity(alertSeverity)
                        .message(message)
                        .suggestedOrder(forecast.getSuggestedOrder())
                        .build();

                alerts.add(alert);
            }
        }

        if (severity != null && !severity.isEmpty()) {
            alerts = alerts.stream()
                    .filter(a -> a.getSeverity().equalsIgnoreCase(severity))
                    .collect(Collectors.toList());
        }

        alerts.sort(Comparator.comparing(AlertDTO::getStockoutRisk).reversed());
        return ResponseEntity.ok(alerts);
    }

    @GetMapping("/critical")
    @Operation(summary = "Listar apenas alertas críticos (alto risco)")
    public ResponseEntity<List<AlertDTO>> getCriticalAlerts() {
        return getAlerts("ALTO");
    }

    @GetMapping("/count")
    @Operation(summary = "Contagem de alertas por severidade")
    public ResponseEntity<Object> getAlertCounts() {
        List<AlertDTO> allAlerts = getAlerts(null).getBody();
        long critical = allAlerts.stream().filter(a -> "ALTO".equals(a.getSeverity())).count();
        long medium = allAlerts.stream().filter(a -> "MÉDIO".equals(a.getSeverity())).count();
        long low = allAlerts.stream().filter(a -> "BAIXO".equals(a.getSeverity())).count();

        var response = new HashMap<String, Long>();
        response.put("critical", critical);
        response.put("medium", medium);
        response.put("low", low);
        response.put("total", critical + medium + low);
        return ResponseEntity.ok(response);
    }
}