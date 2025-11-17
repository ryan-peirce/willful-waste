#!/usr/bin/env python3
"""
Load Generator for Willful Waste Demo
Simulates realistic user traffic for observability demonstration
"""

import os
import time
import random
import requests
from datetime import datetime

# Configuration
PRODUCT_SERVICE_URL = os.getenv('PRODUCT_SERVICE_URL', 'http://product-service:8080')
ORDER_SERVICE_URL = os.getenv('ORDER_SERVICE_URL', 'http://order-service:3000')
LOAD_PATTERN = os.getenv('LOAD_PATTERN', 'steady')  # steady, burst, variable
REQUESTS_PER_MINUTE = int(os.getenv('REQUESTS_PER_MINUTE', '10'))
ORDER_SUCCESS_RATE = float(os.getenv('ORDER_SUCCESS_RATE', '0.85'))

# Sample data for order creation
CUSTOMER_EMAILS = [
    'alice@example.com',
    'bob@example.com',
    'charlie@example.com',
    'diana@example.com',
    'eve@example.com'
]

def log(message):
    """Log with timestamp"""
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    print(f'[{timestamp}] {message}')

def browse_products():
    """Simulate browsing products"""
    try:
        response = requests.get(
            f'{PRODUCT_SERVICE_URL}/api/products',
            timeout=5
        )
        if response.status_code == 200:
            products = response.json()
            log(f'✓ Browsed products: {len(products)} found')
            return products
        else:
            log(f'✗ Failed to browse products: {response.status_code}')
            return []
    except Exception as e:
        log(f'✗ Error browsing products: {str(e)}')
        return []

def browse_product_by_id(product_id):
    """Simulate viewing a specific product"""
    try:
        response = requests.get(
            f'{PRODUCT_SERVICE_URL}/api/products/{product_id}',
            timeout=5
        )
        if response.status_code == 200:
            product = response.json()
            log(f'✓ Viewed product: {product.get("name", "Unknown")}')
            return product
        else:
            log(f'✗ Failed to view product {product_id}: {response.status_code}')
            return None
    except Exception as e:
        log(f'✗ Error viewing product {product_id}: {str(e)}')
        return None

def create_order(product):
    """Simulate creating an order"""
    try:
        # Randomly decide if this order should fail (for demo purposes)
        should_fail = random.random() > ORDER_SUCCESS_RATE
        
        if should_fail:
            # Use invalid product ID to generate error
            product_id = 99999
            product_name = 'Invalid Product'
        else:
            product_id = product.get('id', 1)
            product_name = product.get('name', 'Sample Product')
        
        quantity = random.randint(1, 5)
        unit_price = float(product.get('price', 10.00)) if not should_fail else 10.00
        total_price = round(unit_price * quantity, 2)
        
        order_data = {
            'productId': product_id,
            'productName': product_name,
            'quantity': quantity,
            'totalPrice': total_price,
            'customerEmail': random.choice(CUSTOMER_EMAILS)
        }
        
        response = requests.post(
            f'{ORDER_SERVICE_URL}/api/orders',
            json=order_data,
            timeout=5
        )
        
        if response.status_code == 201:
            order = response.json()
            log(f'✓ Created order #{order.get("id")}: {product_name} x{quantity}')
            return order
        else:
            log(f'✗ Failed to create order: {response.status_code}')
            return None
    except Exception as e:
        log(f'✗ Error creating order: {str(e)}')
        return None

def get_delay():
    """Calculate delay between requests based on load pattern"""
    base_delay = 60.0 / REQUESTS_PER_MINUTE
    
    if LOAD_PATTERN == 'steady':
        # Consistent load with minor variations
        return base_delay + random.uniform(-0.2, 0.2)
    
    elif LOAD_PATTERN == 'burst':
        # Bursts of activity followed by quiet periods
        if random.random() < 0.3:  # 30% chance of burst
            return base_delay * 0.2  # Much faster
        else:
            return base_delay * 2.0  # Slower during quiet periods
    
    elif LOAD_PATTERN == 'variable':
        # Highly variable load
        return base_delay * random.uniform(0.5, 3.0)
    
    else:
        return base_delay

def generate_load():
    """Main load generation loop"""
    log('=== Load Generator Started ===')
    log(f'Product Service: {PRODUCT_SERVICE_URL}')
    log(f'Order Service: {ORDER_SERVICE_URL}')
    log(f'Load Pattern: {LOAD_PATTERN}')
    log(f'Target Rate: {REQUESTS_PER_MINUTE} requests/minute')
    log(f'Order Success Rate: {ORDER_SUCCESS_RATE * 100}%')
    log('==============================')
    
    # Wait a bit for services to be ready
    time.sleep(10)
    
    iteration = 0
    
    while True:
        try:
            iteration += 1
            
            # Decide action: 70% browse, 30% order
            action = random.random()
            
            if action < 0.7:
                # Browse products
                if random.random() < 0.5:
                    # List all products
                    browse_products()
                else:
                    # View specific product
                    product_id = random.randint(1, 10)
                    browse_product_by_id(product_id)
            
            else:
                # Create order
                # First get a product
                products = browse_products()
                if products:
                    product = random.choice(products)
                    create_order(product)
                else:
                    # If no products, use dummy data
                    dummy_product = {
                        'id': 1,
                        'name': 'Sample Product',
                        'price': 9.99
                    }
                    create_order(dummy_product)
            
            # Log progress every 10 iterations
            if iteration % 10 == 0:
                log(f'--- Completed {iteration} requests ---')
            
            # Wait before next request
            delay = get_delay()
            time.sleep(delay)
            
        except KeyboardInterrupt:
            log('=== Load Generator Stopped ===')
            break
        except Exception as e:
            log(f'✗ Unexpected error: {str(e)}')
            time.sleep(5)  # Wait before retrying

if __name__ == '__main__':
    generate_load()
