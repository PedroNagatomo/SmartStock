package com.inventory.service;

import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class WhatsAppService {

    @Value("${twilio.account.sid:}")
    private String accountSid;

    @Value("${twilio.auth.token:}")
    private String authToken;

    @Value("${twilio.whatsapp.from:}")
    private String fromNumber;

    @Value("${twilio.whatsapp.to:}")
    private String toNumber;

    private boolean enabled = false;

    @PostConstruct
    public void init() {
        if (accountSid != null && !accountSid.isEmpty() &&
                authToken != null && !authToken.isEmpty() &&
                fromNumber != null && !fromNumber.isEmpty() &&
                toNumber != null && !toNumber.isEmpty()) {
            Twilio.init(accountSid, authToken);
            enabled = true;
            log.info("Serviço WhatsApp inicializado.");
        } else {
            log.info("Configurações do Twilio incompletas. WhatsApp desabilitado.");
        }
    }

    public void sendAlert(String message) {
        if (!enabled) {
            log.debug("WhatsApp desabilitado. Mensagem ignorada: {}", message);
            return;
        }
        try {
            Message.creator(
                    new PhoneNumber("whatsapp:" + toNumber),
                    new PhoneNumber("whatsapp:" + fromNumber),
                    message
            ).create();
            log.info("Alerta WhatsApp enviado: {}", message);
        } catch (Exception e) {
            log.warn("Erro ao enviar WhatsApp: {}", e.getMessage());
        }
    }
}