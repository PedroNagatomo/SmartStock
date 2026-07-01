package com.inventory.service;

import com.inventory.model.Product;
import com.inventory.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class AlertService {

    private final ProductRepository productRepository;
    private final DemandForecastService forecastService;
    private final JavaMailSender mailSender;
    private final WhatsAppService whatsAppService;

    // Novas propriedades para controle
    @Value("${app.alerts.email.enabled:true}")
    private boolean emailEnabled;

    @Value("${spring.mail.username:}")
    private String mailUsername;

    /**
     * Verifica estoque a cada 4 horas e envia alertas
     */
    @Scheduled(fixedRate = 14400000) // 4 horas
    public void checkStockLevels() {
        log.info("Verificando níveis de estoque...");

        List<Product> activeProducts = productRepository.findByActiveTrue();
        Map<String, List<Product>> alerts = new HashMap<>();

        for (Product product : activeProducts) {
            DemandForecast forecast = forecastService.forecastDemand(product);

            if (forecast.getStockoutRisk() > 50) {
                alerts.computeIfAbsent("ALTO", k -> new java.util.ArrayList<>()).add(product);
            } else if (product.getCurrentStock() <= forecast.getReorderPoint()) {
                alerts.computeIfAbsent("MÉDIO", k -> new java.util.ArrayList<>()).add(product);
            }
        }

        if (!alerts.isEmpty()) {
            sendAlertEmails(alerts);
            sendWhatsAppAlerts(alerts);
        }
    }

    private void sendAlertEmails(Map<String, List<Product>> alerts) {
        // Verifica se o e-mail está habilitado e se as credenciais foram configuradas
        if (!emailEnabled || mailUsername == null || mailUsername.isEmpty()) {
            log.info("Envio de e-mails desabilitado ou credenciais não configuradas. Alertas por e-mail ignorados.");
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo("gerente@loja.com"); // idealmente pegar de configuração
            message.setSubject("🚨 Alerta de Estoque - Ação Necessária");

            StringBuilder body = new StringBuilder();
            body.append("Relatório de Estoque Crítico\n\n");

            alerts.forEach((severity, products) -> {
                body.append("Prioridade ").append(severity).append(":\n");
                products.forEach(p ->
                        body.append("- ").append(p.getName())
                                .append(" (SKU: ").append(p.getSku())
                                .append(", Estoque: ").append(p.getCurrentStock())
                                .append(", Mínimo: ").append(p.getMinimumStock())
                                .append(")\n")
                );
                body.append("\n");
            });

            message.setText(body.toString());
            mailSender.send(message);

            log.info("Alertas de estoque enviados por email com sucesso.");
        } catch (Exception e) {
            log.warn("Falha ao enviar e-mail de alerta: {}. Verifique as configurações de e-mail.", e.getMessage());
        }
    }

    private void sendWhatsAppAlerts(Map<String, List<Product>> alerts) {
        int criticalCount = alerts.getOrDefault("ALTO", List.of()).size();
        if (criticalCount > 0) {
            try {
                String alertMessage = String.format(
                        "🚨 %d produtos com risco crítico de ruptura! Verifique o dashboard.",
                        criticalCount
                );
                whatsAppService.sendAlert(alertMessage);
            } catch (Exception e) {
                log.warn("Falha ao enviar alerta WhatsApp: {}", e.getMessage());
            }
        }
    }
}