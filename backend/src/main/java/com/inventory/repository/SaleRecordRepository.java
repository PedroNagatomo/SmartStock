package com.inventory.repository;

import com.inventory.model.SaleRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface SaleRecordRepository extends JpaRepository<SaleRecord, Long> {

    List<SaleRecord> findByProductIdAndSaleDateBetweenOrderBySaleDateAsc(
            Long productId, LocalDate startDate, LocalDate endDate);

    @Query("SELECT AVG(s.quantity) FROM SaleRecord s WHERE s.product.id = :productId " +
            "AND s.saleDate BETWEEN :startDate AND :endDate")
    Double getAverageDailySales(Long productId, LocalDate startDate, LocalDate endDate);

    @Query("SELECT SUM(s.quantity) FROM SaleRecord s WHERE s.product.id = :productId " +
            "AND s.saleDate BETWEEN :startDate AND :endDate")
    Integer getTotalSales(Long productId, LocalDate startDate, LocalDate endDate);
}
