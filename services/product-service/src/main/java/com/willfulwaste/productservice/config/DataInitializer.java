package com.willfulwaste.productservice.config;

import com.willfulwaste.productservice.model.Product;
import com.willfulwaste.productservice.repository.ProductRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.math.BigDecimal;

@Configuration
public class DataInitializer {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    @Bean
    CommandLineRunner initDatabase(ProductRepository repository) {
        return args -> {
            // Check if products already exist
            if (repository.count() == 0) {
                logger.info("Initializing product database with sample data...");
                
                Product product1 = new Product();
                product1.setName("Laptop");
                product1.setDescription("High-performance laptop");
                product1.setPrice(new BigDecimal("999.99"));
                product1.setStockQuantity(50);
                product1.setCategory("Electronics");
                repository.save(product1);
                
                Product product2 = new Product();
                product2.setName("Smartphone");
                product2.setDescription("Latest model smartphone");
                product2.setPrice(new BigDecimal("699.99"));
                product2.setStockQuantity(100);
                product2.setCategory("Electronics");
                repository.save(product2);
                
                Product product3 = new Product();
                product3.setName("Headphones");
                product3.setDescription("Wireless noise-cancelling headphones");
                product3.setPrice(new BigDecimal("199.99"));
                product3.setStockQuantity(75);
                product3.setCategory("Electronics");
                repository.save(product3);
                
                Product product4 = new Product();
                product4.setName("Monitor");
                product4.setDescription("4K UHD monitor");
                product4.setPrice(new BigDecimal("399.99"));
                product4.setStockQuantity(30);
                product4.setCategory("Electronics");
                repository.save(product4);
                
                Product product5 = new Product();
                product5.setName("Keyboard");
                product5.setDescription("Mechanical gaming keyboard");
                product5.setPrice(new BigDecimal("149.99"));
                product5.setStockQuantity(60);
                product5.setCategory("Electronics");
                repository.save(product5);
                
                Product product6 = new Product();
                product6.setName("Mouse");
                product6.setDescription("Wireless gaming mouse");
                product6.setPrice(new BigDecimal("79.99"));
                product6.setStockQuantity(80);
                product6.setCategory("Electronics");
                repository.save(product6);
                
                Product product7 = new Product();
                product7.setName("Tablet");
                product7.setDescription("10-inch tablet");
                product7.setPrice(new BigDecimal("499.99"));
                product7.setStockQuantity(40);
                product7.setCategory("Electronics");
                repository.save(product7);
                
                Product product8 = new Product();
                product8.setName("Smart Watch");
                product8.setDescription("Fitness tracking smart watch");
                product8.setPrice(new BigDecimal("299.99"));
                product8.setStockQuantity(55);
                product8.setCategory("Electronics");
                repository.save(product8);
                
                logger.info("Product database initialized with {} products", repository.count());
            } else {
                logger.info("Product database already contains {} products, skipping initialization", repository.count());
            }
        };
    }
}
