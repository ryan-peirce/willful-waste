#!/bin/bash
# Push Docker images to Google Container Registry

set -e

PROJECT_ID="willful-waste"

echo "=== Pushing Images to GCR ==="
echo "Project: $PROJECT_ID"
echo "=============================="

# Configure Docker for GCR
gcloud auth configure-docker gcr.io

# Get current git commit
GIT_COMMIT=$(git rev-parse --short HEAD)

# Push Product Service
echo ""
echo "Pushing Product Service..."
docker push gcr.io/$PROJECT_ID/product-service:latest
docker push gcr.io/$PROJECT_ID/product-service:$GIT_COMMIT
echo "✓ Product Service pushed"

# Push Order Service
echo ""
echo "Pushing Order Service..."
docker push gcr.io/$PROJECT_ID/order-service:latest
docker push gcr.io/$PROJECT_ID/order-service:$GIT_COMMIT
echo "✓ Order Service pushed"

# Push Load Generator
echo ""
echo "Pushing Load Generator..."
docker push gcr.io/$PROJECT_ID/load-generator:latest
docker push gcr.io/$PROJECT_ID/load-generator:$GIT_COMMIT
echo "✓ Load Generator pushed"

echo ""
echo "Pushing Frontend..."
docker push gcr.io/$PROJECT_ID/frontend:latest
docker push gcr.io/$PROJECT_ID/frontend:$GIT_COMMIT
echo "✓ Frontend pushed"

echo ""
echo "=== All Images Pushed Successfully ==="
echo ""
echo "Images available at:"
echo "  gcr.io/$PROJECT_ID/product-service:latest"
echo "  gcr.io/$PROJECT_ID/order-service:latest"
echo "  gcr.io/$PROJECT_ID/load-generator:latest"
echo "  gcr.io/$PROJECT_ID/frontend:latest"
