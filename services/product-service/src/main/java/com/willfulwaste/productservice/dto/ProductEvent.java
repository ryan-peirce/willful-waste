package com.willfulwaste.productservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductEvent {
    
    private String eventType; // CREATED, UPDATED, DELETED
    private Long productId;
    private String name;
    private BigDecimal price;
    private Integer stockQuantity;
    private String category;
    private Long timestamp;
}
