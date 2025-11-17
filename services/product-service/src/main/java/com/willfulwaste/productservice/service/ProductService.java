package com.willfulwaste.productservice.service;

import com.willfulwaste.productservice.dto.ProductEvent;
import com.willfulwaste.productservice.model.Product;
import com.willfulwaste.productservice.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductService {

    private final ProductRepository productRepository;
    private final KafkaTemplate<String, ProductEvent> kafkaTemplate;
    private static final String TOPIC = "product-events";

    public List<Product> getAllProducts() {
        log.info("Fetching all products");
        return productRepository.findAll();
    }

    public Product getProductById(Long id) {
        log.info("Fetching product with id: {}", id);
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
    }

    @Transactional
    public Product createProduct(Product product) {
        log.info("Creating new product: {}", product.getName());
        Product savedProduct = productRepository.save(product);
        
        // Publish event to Kafka
        publishProductEvent(savedProduct, "CREATED");
        
        return savedProduct;
    }

    @Transactional
    public Product updateProduct(Long id, Product productDetails) {
        log.info("Updating product with id: {}", id);
        Product product = getProductById(id);
        
        product.setName(productDetails.getName());
        product.setDescription(productDetails.getDescription());
        product.setPrice(productDetails.getPrice());
        product.setStockQuantity(productDetails.getStockQuantity());
        product.setCategory(productDetails.getCategory());
        
        Product updatedProduct = productRepository.save(product);
        
        // Publish event to Kafka
        publishProductEvent(updatedProduct, "UPDATED");
        
        return updatedProduct;
    }

    @Transactional
    public void deleteProduct(Long id) {
        log.info("Deleting product with id: {}", id);
        Product product = getProductById(id);
        productRepository.delete(product);
        
        // Publish event to Kafka
        publishProductEvent(product, "DELETED");
    }

    public List<Product> getProductsByCategory(String category) {
        log.info("Fetching products by category: {}", category);
        return productRepository.findByCategory(category);
    }

    private void publishProductEvent(Product product, String eventType) {
        try {
            ProductEvent event = new ProductEvent(
                    eventType,
                    product.getId(),
                    product.getName(),
                    product.getPrice(),
                    product.getStockQuantity(),
                    product.getCategory(),
                    System.currentTimeMillis()
            );
            
            kafkaTemplate.send(TOPIC, product.getId().toString(), event);
            log.info("Published {} event for product id: {}", eventType, product.getId());
        } catch (Exception e) {
            log.error("Failed to publish event for product id: {}", product.getId(), e);
        }
    }
}
