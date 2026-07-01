package com.inventory.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.inventory.dto.ProductDTO;
import com.inventory.model.Product;
import com.inventory.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc
class ProductControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ProductRepository productRepository;

    @BeforeEach
    void setUp() {
        productRepository.deleteAll();
    }

    @Test
    void shouldCreateProduct() throws Exception {
        ProductDTO productDTO = ProductDTO.builder()
                .sku("TEST-001")
                .name("Produto Teste")
                .category("Testes")
                .currentStock(100)
                .minimumStock(20)
                .maximumStock(200)
                .unitPrice(new BigDecimal("29.90"))
                .leadTimeDays(7)
                .serviceLevel(0.95)
                .build();

        mockMvc.perform(post("/api/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(productDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.sku").value("TEST-001"))
                .andExpect(jsonPath("$.name").value("Produto Teste"));
    }

    @Test
    void shouldGetProductById() throws Exception {
        Product product = new Product();
        product.setSku("TEST-002");
        product.setName("Produto 2");
        product.setCurrentStock(50);
        product.setMinimumStock(10);
        product.setMaximumStock(100);
        product.setUnitPrice(new BigDecimal("49.90"));
        product.setLeadTimeDays(7);
        product.setServiceLevel(0.9);
        product.setActive(true);

        Product saved = productRepository.save(product);

        mockMvc.perform(get("/api/products/" + saved.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.sku").value("TEST-002"));
    }

    @Test
    void shouldReturn404WhenProductNotFound() throws Exception {
        mockMvc.perform(get("/api/products/999"))
                .andExpect(status().isNotFound());
    }
}