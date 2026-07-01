package com.inventory.controller;

import com.inventory.dto.SaleRequestDTO;
import com.inventory.model.Product;
import com.inventory.model.SaleRecord;
import com.inventory.model.User;
import com.inventory.repository.ProductRepository;
import com.inventory.repository.SaleRecordRepository;
import com.inventory.exception.ResourceNotFoundException;
import com.inventory.security.CurrentUser;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/sales")
@RequiredArgsConstructor
@Tag(name = "Vendas", description = "Registro e consulta de vendas")
@CrossOrigin(origins = "*")
public class SalesController {

    private final SaleRecordRepository saleRecordRepository;
    private final ProductRepository productRepository;
    private final CurrentUser currentUser;

    @PostMapping
    @Operation(summary = "Registrar nova venda")
    public ResponseEntity<Map<String, Object>> recordSale(@Valid @RequestBody SaleRequestDTO saleRequest) {
        User current = currentUser.get();
        Product product = productRepository.findByUserAndId(current, saleRequest.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Produto", "id", saleRequest.getProductId()));

        if (product.getCurrentStock() < saleRequest.getQuantity()) {
            throw new IllegalArgumentException(
                    String.format("Estoque insuficiente para %s. Disponível: %d, Solicitado: %d",
                            product.getName(), product.getCurrentStock(), saleRequest.getQuantity()));
        }

        SaleRecord sale = new SaleRecord();
        sale.setProduct(product);
        sale.setQuantity(saleRequest.getQuantity());
        sale.setUnitPrice(saleRequest.getUnitPrice() != null ?
                saleRequest.getUnitPrice() : product.getUnitPrice());

        if (saleRequest.getSaleDate() != null && !saleRequest.getSaleDate().isEmpty()) {
            sale.setSaleDate(LocalDate.parse(saleRequest.getSaleDate(), DateTimeFormatter.ISO_DATE));
        } else {
            sale.setSaleDate(LocalDate.now());
        }

        product.setCurrentStock(product.getCurrentStock() - saleRequest.getQuantity());
        SaleRecord savedSale = saleRecordRepository.save(sale);
        productRepository.save(product);

        Map<String, Object> response = new HashMap<>();
        response.put("sale", savedSale);
        response.put("currentStock", product.getCurrentStock());
        response.put("message", "Venda registrada com sucesso");

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/product/{productId}")
    @Operation(summary = "Consultar histórico de vendas de um produto")
    public ResponseEntity<List<SaleRecord>> getProductSales(
            @PathVariable Long productId,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {

        User current = currentUser.get();
        Product product = productRepository.findByUserAndId(current, productId)
                .orElseThrow(() -> new ResourceNotFoundException("Produto", "id", productId));

        LocalDate start = startDate != null ?
                LocalDate.parse(startDate, DateTimeFormatter.ISO_DATE) :
                LocalDate.now().minusDays(90);
        LocalDate end = endDate != null ?
                LocalDate.parse(endDate, DateTimeFormatter.ISO_DATE) :
                LocalDate.now();

        List<SaleRecord> sales = saleRecordRepository
                .findByProductIdAndSaleDateBetweenOrderBySaleDateAsc(productId, start, end);

        return ResponseEntity.ok(sales);
    }

    @GetMapping("/today")
    @Operation(summary = "Total de vendas do dia")
    public ResponseEntity<Map<String, Object>> getTodaySales() {
        User current = currentUser.get();
        List<Product> products = productRepository.findByUserAndActiveTrue(current);

        int totalSold = 0;
        double totalRevenue = 0;
        for (Product product : products) {
            List<SaleRecord> todaySales = saleRecordRepository
                    .findByProductIdAndSaleDateBetweenOrderBySaleDateAsc(
                            product.getId(), LocalDate.now(), LocalDate.now());
            for (SaleRecord sale : todaySales) {
                totalSold += sale.getQuantity();
                if (sale.getTotalValue() != null) {
                    totalRevenue += sale.getTotalValue().doubleValue();
                }
            }
        }

        Map<String, Object> response = new HashMap<>();
        response.put("totalUnitsSold", totalSold);
        response.put("totalRevenue", totalRevenue);
        response.put("date", LocalDate.now().toString());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/bulk")
    @Operation(summary = "Registrar múltiplas vendas (carga inicial)")
    public ResponseEntity<Map<String, Object>> recordBulkSales(
            @Valid @RequestBody List<SaleRequestDTO> sales) {

        int successCount = 0;
        int errorCount = 0;
        for (SaleRequestDTO saleRequest : sales) {
            try {
                recordSale(saleRequest);
                successCount++;
            } catch (Exception e) {
                errorCount++;
            }
        }

        Map<String, Object> response = new HashMap<>();
        response.put("totalProcessed", sales.size());
        response.put("successCount", successCount);
        response.put("errorCount", errorCount);

        return ResponseEntity.ok(response);
    }
}