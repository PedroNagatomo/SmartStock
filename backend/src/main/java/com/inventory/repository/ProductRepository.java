package com.inventory.repository;

import com.inventory.model.Product;
import com.inventory.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    Optional<Product> findBySku(String sku);
    List<Product> findByActiveTrue();
    List<Product> findBycurrentStockLessThan(Integer minimumStock);
    List<Product> findByUserAndActiveTrue(User user);
    Optional<Product> findByUserAndId(User user, Long id);
    Optional<Product> findByUserAndSku(User user, String sku);
    List<Product> findByUserAndCurrentStockLessThan(User user, Integer minimumStock);
}
