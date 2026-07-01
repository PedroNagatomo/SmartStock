package com.inventory;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class SmartInventoryApplication {

	public static void main(String[] args) {
		SpringApplication.run(SmartInventoryApplication.class, args);
		System.out.println("""
            
            ╔══════════════════════════════════════════════════════╗
            ║         SMART INVENTORY SYSTEM - ONLINE              ║
            ║                                                      ║
            ║  API:        http://localhost:8080/api               ║
            ║  Swagger:    http://localhost:8080/swagger-ui.html   ║
            ║  H2 Console: http://localhost:8080/h2-console        ║
            ║                                                      ║
            ╚══════════════════════════════════════════════════════╝
            """);
	}
}