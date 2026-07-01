package com.inventory.controller;

import com.inventory.dto.ProductDTO;
import com.inventory.model.Product;
import com.inventory.model.User;
import com.inventory.repository.ProductRepository;
import com.inventory.exception.ResourceNotFoundException;
import com.inventory.security.CurrentUser;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
@Tag(name = "Produtos", description = "Gerenciamento de produtos")
@CrossOrigin(origins = "*")
public class ProductController {

    private final ProductRepository productRepository;

    private final CurrentUser currentUser;

    @GetMapping
    public ResponseEntity<List<ProductDTO>> getAllProducts(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search) {

        User current = currentUser.get();
        List<Product> products = productRepository.findByUserAndActiveTrue(current);

        if (category != null && !category.isEmpty()) {
            products = products.stream()
                    .filter(p -> p.getCategory() != null && p.getCategory().equalsIgnoreCase(category))
                    .collect(Collectors.toList());
        }
        if (search != null && !search.isEmpty()) {
            String term = search.toLowerCase();
            products = products.stream()
                    .filter(p -> p.getName().toLowerCase().contains(term) ||
                            p.getSku().toLowerCase().contains(term))
                    .collect(Collectors.toList());
        }

        return ResponseEntity.ok(products.stream().map(this::convertToDTO).collect(Collectors.toList()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar produto por ID")
    public ResponseEntity<ProductDTO> getProduct(@PathVariable Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Produto", "id", id));

        return ResponseEntity.ok(convertToDTO(product));
    }

    @GetMapping("/sku/{sku}")
    @Operation(summary = "Buscar produto por SKU")
    public ResponseEntity<ProductDTO> getProductBySku(@PathVariable String sku) {
        Product product = productRepository.findBySku(sku)
                .orElseThrow(() -> new ResourceNotFoundException("Produto", "sku", sku));

        return ResponseEntity.ok(convertToDTO(product));
    }

    @PostMapping
    @Operation(summary = "Criar novo produto")
    public ResponseEntity<ProductDTO> createProduct(@Valid @RequestBody ProductDTO productDTO) {

        // Verificar se SKU já existe
        if (productRepository.findBySku(productDTO.getSku()).isPresent()) {
            throw new IllegalArgumentException("SKU já cadastrado: " + productDTO.getSku());
        }

        Product product = convertToEntity(productDTO);
        product.setUser(currentUser.get());
        product.setActive(true);

        if (product.getServiceLevel() == null) {
            product.setServiceLevel(0.9);
        }
        if (product.getLeadTimeDays() == null) {
            product.setLeadTimeDays(7);
        }

        Product savedProduct = productRepository.save(product);
        return ResponseEntity.status(HttpStatus.CREATED).body(convertToDTO(savedProduct));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar produto existente")
    public ResponseEntity<ProductDTO> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProductDTO productDTO) {

        Product existingProduct = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Produto", "id", id));

        // Atualizar campos
        existingProduct.setName(productDTO.getName());
        existingProduct.setCategory(productDTO.getCategory());
        existingProduct.setCurrentStock(productDTO.getCurrentStock());
        existingProduct.setMinimumStock(productDTO.getMinimumStock());
        existingProduct.setMaximumStock(productDTO.getMaximumStock());
        existingProduct.setUnitPrice(productDTO.getUnitPrice());
        existingProduct.setLeadTimeDays(productDTO.getLeadTimeDays());
        existingProduct.setServiceLevel(productDTO.getServiceLevel());

        if (productDTO.getActive() != null) {
            existingProduct.setActive(productDTO.getActive());
        }

        Product updatedProduct = productRepository.save(existingProduct);
        return ResponseEntity.ok(convertToDTO(updatedProduct));
    }

    @PatchMapping("/{id}/stock")
    @Operation(summary = "Atualizar apenas o estoque do produto")
    public ResponseEntity<ProductDTO> updateStock(
            @PathVariable Long id,
            @RequestParam Integer quantity) {

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Produto", "id", id));

        int newStock = product.getCurrentStock() + quantity;
        if (newStock < 0) {
            throw new IllegalArgumentException("Estoque insuficiente. Disponível: " +
                    product.getCurrentStock() + ", solicitado: " + Math.abs(quantity));
        }

        product.setCurrentStock(newStock);
        Product updatedProduct = productRepository.save(product);

        return ResponseEntity.ok(convertToDTO(updatedProduct));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Desativar produto (soft delete)")
    public ResponseEntity<Void> deactivateProduct(@PathVariable Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Produto", "id", id));

        product.setActive(false);
        productRepository.save(product);

        return ResponseEntity.noContent().build();
    }

    private ProductDTO convertToDTO(Product product) {
        return ProductDTO.builder()
                .id(product.getId())
                .sku(product.getSku())
                .name(product.getName())
                .category(product.getCategory())
                .currentStock(product.getCurrentStock())
                .minimumStock(product.getMinimumStock())
                .maximumStock(product.getMaximumStock())
                .unitPrice(product.getUnitPrice())
                .leadTimeDays(product.getLeadTimeDays())
                .serviceLevel(product.getServiceLevel())
                .active(product.getActive())
                .build();
    }

    private Product convertToEntity(ProductDTO dto) {
        Product product = new Product();
        product.setSku(dto.getSku());
        product.setName(dto.getName());
        product.setCategory(dto.getCategory());
        product.setCurrentStock(dto.getCurrentStock());
        product.setMinimumStock(dto.getMinimumStock());
        product.setMaximumStock(dto.getMaximumStock());
        product.setUnitPrice(dto.getUnitPrice());
        product.setLeadTimeDays(dto.getLeadTimeDays());
        product.setServiceLevel(dto.getServiceLevel());
        return product;
    }
}