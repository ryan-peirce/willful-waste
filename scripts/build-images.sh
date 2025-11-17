#!/bin/bash
# Build Docker images for all services

set -e

PROJECT_ID="willful-waste"
REGION="us-central1"

echo "=== Building Docker Images ==="
echo "Project: $PROJECT_ID"
echo "================================"

# Product Service
echo ""
echo "Building Product Service..."
cd services/product-service
docker build -t gcr.io/$PROJECT_ID/product-service:latest .
docker build -t gcr.io/$PROJECT_ID/product-service:$(git rev-parse --short HEAD) .
cd ../..
echo "✓ Product Service built"

# Order Service
echo ""
echo "Building Order Service..."
cd services/order-service
docker build -t gcr.io/$PROJECT_ID/order-service:latest .
docker build -t gcr.io/$PROJECT_ID/order-service:$(git rev-parse --short HEAD) .
cd ../..
echo "✓ Order Service built"

# Load Generator
echo ""
echo "Building Load Generator..."
cd services/load-generator
docker build -t gcr.io/$PROJECT_ID/load-generator:latest .
docker build -t gcr.io/$PROJECT_ID/load-generator:$(git rev-parse --short HEAD) .
cd ../..
echo "✓ Load Generator built"

# Frontend
echo ""
echo "Building Frontend..."
cd services/frontend
docker build -t gcr.io/$PROJECT_ID/frontend:latest .
docker build -t gcr.io/$PROJECT_ID/frontend:$(git rev-parse --short HEAD) .
cd ../..
echo "✓ Frontend built"

echo ""
echo "=== All Images Built Successfully ==="
echo ""
echo "To push images to GCR, run:"
echo "./scripts/push-images.sh"
