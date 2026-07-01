package com.inventory.service;

import com.inventory.model.Product;
import com.inventory.model.SaleRecord;
import com.inventory.repository.SaleRecordRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DemandForecastServiceTest {

    @Mock
    private SaleRecordRepository saleRecordRepository;

    @InjectMocks
    private DemandForecastService forecastService;

    private Product product;
    private List<SaleRecord> salesHistory;

    @BeforeEach
    void setUp() {
        product = new Product();
        product.setId(1L);
        product.setSku("TEST-001");
        product.setName("Produto Teste");
        product.setCurrentStock(50);
        product.setMinimumStock(20);
        product.setLeadTimeDays(7);
        product.setServiceLevel(0.95);

        // Criar histórico de vendas simulado
        SaleRecord sale1 = createSale(1L, 5, LocalDate.now().minusDays(1));
        SaleRecord sale2 = createSale(2L, 3, LocalDate.now().minusDays(2));
        SaleRecord sale3 = createSale(3L, 7, LocalDate.now().minusDays(3));
        SaleRecord sale4 = createSale(4L, 4, LocalDate.now().minusDays(4));
        SaleRecord sale5 = createSale(5L, 6, LocalDate.now().minusDays(5));

        salesHistory = Arrays.asList(sale1, sale2, sale3, sale4, sale5);
    }

    @Test
    void shouldForecastDemand() {
        when(saleRecordRepository.findByProductIdAndSaleDateBetweenOrderBySaleDateAsc(
                anyLong(), any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(salesHistory);

        DemandForecast forecast = forecastService.forecastDemand(product);

        assertThat(forecast).isNotNull();
        assertThat(forecast.getProductId()).isEqualTo(1L);
        assertThat(forecast.getAverageDailyDemand()).isGreaterThan(0);
        assertThat(forecast.getSafetyStock()).isGreaterThan(0);
        assertThat(forecast.getReorderPoint()).isGreaterThan(0);
        assertThat(forecast.getCurrentStock()).isEqualTo(50);
    }

    @Test
    void shouldReturnDefaultForecastWhenNoSalesHistory() {
        when(saleRecordRepository.findByProductIdAndSaleDateBetweenOrderBySaleDateAsc(
                anyLong(), any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(Arrays.asList());

        DemandForecast forecast = forecastService.forecastDemand(product);

        assertThat(forecast).isNotNull();
        assertThat(forecast.getAverageDailyDemand()).isEqualTo(0);
        assertThat(forecast.getDaysUntilStockout()).isEqualTo(999);
    }

    @Test
    void shouldCalculateStockoutRisk() {
        when(saleRecordRepository.findByProductIdAndSaleDateBetweenOrderBySaleDateAsc(
                anyLong(), any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(salesHistory);

        product.setCurrentStock(5); // Estoque muito baixo
        DemandForecast forecast = forecastService.forecastDemand(product);

        assertThat(forecast.getStockoutRisk()).isGreaterThan(50);
    }

    private SaleRecord createSale(Long id, int quantity, LocalDate date) {
        SaleRecord sale = new SaleRecord();
        sale.setId(id);
        sale.setProduct(product);
        sale.setQuantity(quantity);
        sale.setSaleDate(date);
        sale.setUnitPrice(BigDecimal.valueOf(29.90));
        return sale;
    }
}