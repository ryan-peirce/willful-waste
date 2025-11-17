# Willful Waste - Retail Startup Demo

A microservices-based e-commerce application built for observability demonstration with Dash0.

## Overview

Willful Waste is a demo retail startup selling inexpensive, everyday products online. This application demonstrates modern cloud-native architecture patterns with distributed tracing, metrics, and logging capabilities.

### Architecture

- **Product Service** (Java/Spring Boot) - Manages product catalog
- **Order Service** (Node.js/Express) - Handles order processing  
- **Load Generator** (Python) - Simulates realistic user traffic
- **Apache Kafka** - Event streaming between services
- **PostgreSQL** (Cloud SQL) - Data persistence
- **GKE** - Kubernetes orchestration

## Prerequisites

- **GCP Account** with billing enabled
- **gcloud CLI** installed and configured
- **Terraform** >= 1.5.0
- **kubectl** installed
- **Docker** installed
- **Git** configured

## Quick Start

### 1. Clone Repository

```bash
git clone https://github.com/ryan-peirce/willful-waste.git
cd willful-waste
```

### 2. Set Up GCP Project

```bash
# Configure gcloud
gcloud config set project willful-waste
gcloud auth application-default login

# Create Terraform state bucket
gsutil mb -p willful-waste -l us-central1 gs://willful-waste-terraform-state
gsutil versioning set on gs://willful-waste-terraform-state
```

### 3. Deploy Infrastructure

```bash
cd terraform
terraform init
terraform plan
terraform apply -auto-approve
cd ..
```

**Wait 10-15 minutes** for GKE cluster and Cloud SQL to provision.

### 4. Configure kubectl

```bash
gcloud container clusters get-credentials willful-waste-cluster \
  --zone=us-central1-a \
  --project=willful-waste
```

### 5. Deploy Kafka

```bash
# Install Strimzi operator
kubectl create namespace kafka
kubectl create -f 'https://strimzi.io/install/latest?namespace=kafka' -n kafka

# Wait for operator
kubectl wait --for=condition=Ready pod -l name=strimzi-cluster-operator \
  -n kafka --timeout=300s

# Deploy Kafka cluster
kubectl apply -f k8s/kafka/
```

### 6. Create Database Secret

```bash
cd terraform
DB_PASSWORD=$(terraform output -raw db_password 2>/dev/null || echo "password")
DB_HOST=$(terraform output -raw database_private_ip 2>/dev/null || echo "localhost")
cd ..

kubectl create secret generic db-credentials \
  --from-literal=username=appuser \
  --from-literal=password=$DB_PASSWORD \
  --from-literal=host=$DB_HOST \
  --from-literal=products-db=products \
  --from-literal=orders-db=orders
```

### 7. Build and Push Docker Images

```bash
# Configure Docker for GCR
gcloud auth configure-docker gcr.io

# Build images
./scripts/build-images.sh

# Push to GCR
./scripts/push-images.sh
```

### 8. Deploy Services

```bash
kubectl apply -f k8s/product-service/
kubectl apply -f k8s/order-service/
kubectl apply -f k8s/load-generator/
```

### 9. Verify Deployment

```bash
# Check pods
kubectl get pods

# Check services
kubectl get services

# View logs
kubectl logs -l app=product-service --tail=50
kubectl logs -l app=order-service --tail=50
kubectl logs -l app=load-generator --tail=50
```

## Project Structure

```
willful-waste/
├── docs/
│   └── ARCHITECTURE.md          # Detailed architecture documentation
├── terraform/
│   ├── main.tf                  # Main Terraform configuration
│   ├── modules/
│   │   ├── networking/          # VPC, subnets, firewall
│   │   ├── gke/                 # Kubernetes cluster
│   │   └── database/            # Cloud SQL PostgreSQL
│   └── README.md                # Infrastructure guide
├── services/
│   ├── product-service/         # Java/Spring Boot service
│   ├── order-service/           # Node.js/Express service
│   └── load-generator/          # Python traffic simulator
├── k8s/
│   ├── kafka/                   # Kafka deployment
│   ├── product-service/         # K8s manifests
│   ├── order-service/           # K8s manifests
│   ├── load-generator/          # K8s manifests
│   └── README.md                # Deployment guide
└── scripts/
    ├── build-images.sh          # Build Docker images
    └── push-images.sh           # Push to GCR
```

## Testing the Application

### Port Forward to Services

```bash
# Product Service
kubectl port-forward svc/product-service 8080:8080

# Order Service  
kubectl port-forward svc/order-service 3000:3000
```

### Create Sample Products

```bash
# Create a product
curl -X POST http://localhost:8080/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Widget",
    "description": "A useful widget",
    "price": 9.99,
    "stockQuantity": 100,
    "category": "gadgets"
  }'

# List products
curl http://localhost:8080/api/products
```

### Create Sample Order

```bash
# Create an order
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "productId": 1,
    "productName": "Widget",
    "quantity": 2,
    "totalPrice": 19.98,
    "customerEmail": "customer@example.com"
  }'

# List orders
curl http://localhost:3000/api/orders
```

## Monitoring & Observability

### Prometheus Metrics

```bash
# Product Service metrics
kubectl port-forward svc/product-service 8080:8080
curl http://localhost:8080/actuator/prometheus

# Order Service metrics
kubectl port-forward svc/order-service 3000:3000
curl http://localhost:3000/metrics
```

### Load Generator Status

```bash
# View load generator logs
kubectl logs -l app=load-generator -f

# Adjust load pattern (edit and apply)
kubectl edit configmap load-generator-config
kubectl rollout restart deployment/load-generator
```

## Scaling

```bash
# Scale Product Service
kubectl scale deployment product-service --replicas=3

# Scale Order Service
kubectl scale deployment order-service --replicas=3

# Disable load generator
kubectl scale deployment load-generator --replicas=0
```

## Cost Management

**Estimated Monthly Cost:** ~$140-160

To minimize costs:

```bash
# Stop cluster (requires restart)
gcloud container clusters resize willful-waste-cluster \
  --num-nodes=0 --zone=us-central1-a

# Delete everything
terraform destroy -auto-approve
```

## Next Steps - Dash0 Integration

After verifying the application works:

1. Sign up for Dash0 account
2. Add OpenTelemetry instrumentation to services
3. Configure trace export to Dash0
4. Verify traces and metrics in Dash0 dashboard
5. Use for observability demo in interview

## Troubleshooting

### Pods Not Starting

```bash
kubectl describe pod <pod-name>
kubectl logs <pod-name>
```

### Database Connection Issues

```bash
# Verify secret
kubectl get secret db-credentials -o yaml

# Test connection
kubectl run -it --rm debug --image=postgres:14 --restart=Never -- \
  psql -h <DB_HOST> -U appuser -d products
```

### Kafka Issues

```bash
# Check Kafka status
kubectl get kafka -n kafka

# View topics
kubectl -n kafka exec -it kafka-cluster-kafka-0 -- \
  bin/kafka-topics.sh --bootstrap-server localhost:9092 --list
```

## Documentation

- [Architecture Documentation](docs/ARCHITECTURE.md)
- [Terraform Guide](terraform/README.md)
- [Kubernetes Deployment Guide](k8s/README.md)

## Technologies

- **Languages:** Java 17, Node.js 18, Python 3.11
- **Frameworks:** Spring Boot 3.2, Express.js
- **Infrastructure:** Google Kubernetes Engine (GKE), Cloud SQL
- **Messaging:** Apache Kafka (Strimzi)
- **Observability:** Prometheus metrics, structured logging
- **IaC:** Terraform
- **Container Registry:** Google Container Registry (GCR)

## License

This project is for demonstration purposes.

## Contact

- **Owner:** Ryan Peirce
- **Email:** ryan.j.peirce@gmail.com
- **GitHub:** https://github.com/ryan-peirce/willful-waste
