package com.inventory.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Smart Inventory API")
                        .description("Sistema Inteligente de Gestão de Estoque para Varejistas")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("Seu Nome")
                                .email("seu@email.com")
                                .url("https://github.com/seu-usuario/smart-inventory"))
                        .license(new License()
                                .name("Apache 2.0")
                                .url("https://www.apache.org/licenses/LICENSE-2.0")));
    }
}