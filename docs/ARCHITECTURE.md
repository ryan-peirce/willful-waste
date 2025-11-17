# Willful Waste - Retail Startup Demo Architecture

## Overview
A microservices-based e-commerce application demonstrating modern cloud-native architecture patterns, designed for observability demonstration with Dash0.

## Business Context
A growing retail startup selling inexpensive, everyday products online through a simple, scalable platform.

## Architecture Diagram

```
┌─────────────────┐
│  Load Generator │──┐
│    (Python)     │  │
└─────────────────┘  │
                     ↓
┌─────────────────┐  ┌──────────────────┐
│    Frontend     │─→│ Product Service  │
│   (React/HTML)  │  │  (Java/Spring)   │
└─────────────────┘  └────────┬─────────┘
                              │ publish events
                     ┌────────↓─────────┐
                     │  Apache Kafka    │
                     │  (Event Stream)  │
                     └────────┬─────────┘
                              │ consume events
                     ┌────────↓─────────┐
                     │  Order Service   │
                     │  (Node.js/Express)│
                     └────────┬─────────┘
                              │
                     ┌────────↓─────────┐
                     │   PostgreSQL     │
                     │  (Cloud SQL)     │
                     └──────────────────┘
```

## Services

### 1. Product Service (Java/Spring Boot)
**Purpose:** Manages product catalog and inventory

**Endpoints:**
- `GET /api/products` - List all products
- `GET /api/products/{id}` - Get product details
- `POST /api/products` - Create new product
- `PUT /api/products/{id}` - Update product
- `DELETE /api/products/{id}` - Delete product
- `GET /health` - Health check
- `GET /metrics` - Prometheus metrics

**Technology Stack:**
- Java 17
- Spring Boot 3.x
- Spring Data JPA
- Spring Kafka
- PostgreSQL Driver

**Responsibilities:**
- CRUD operations on products
- Publish product events to Kafka
- Data validation
- Database persistence

### 2. Order Service (Node.js/Express)
**Purpose:** Handles order processing and management

**Endpoints:**
- `POST /api/orders` - Create new order
- `GET /api/orders/{id}` - Get order details
- `GET /api/orders` - List orders
- `GET /health` - Health check
- `GET /metrics` - Prometheus metrics

**Technology Stack:**
- Node.js 18+
- Express.js
- Sequelize ORM
- KafkaJS
- PostgreSQL Driver

**Responsibilities:**
- Order creation and validation
- Consume product events from Kafka
- Order persistence
- Product availability checking

### 3. Load Generator (Python)
**Purpose:** Simulates realistic user traffic for demo purposes

**Functionality:**
- Product browsing simulation (70% of traffic)
- Order creation simulation (30% of traffic)
- Random delays (0.5-3 seconds)
- Error scenario generation (15% failure rate)
- Configurable load patterns

**Configuration:**
- `LOAD_PATTERN`: steady, burst, variable
- `REQUESTS_PER_MINUTE`: 10
- `ORDER_SUCCESS_RATE`: 0.85
- `PRODUCT_SERVICE_URL`: http://product-service:8080
- `ORDER_SERVICE_URL`: http://order-service:3000

### 4. Frontend (React/HTML)
**Purpose:** Simple web interface for users

**Features:**
- Product catalog display
- Product detail view
- Shopping cart
- Order placement
- Order history

## Data Flow

### Product Creation Flow
1. Admin creates product via Frontend
2. Product Service saves to PostgreSQL
3. Product Service publishes `product.created` event to Kafka
4. Order Service consumes event and updates local cache

### Order Creation Flow
1. User places order via Frontend
2. Order Service validates product availability
3. Order Service creates order in PostgreSQL
4. Order Service publishes `order.created` event to Kafka
5. Product Service consumes event (for inventory updates)

## Infrastructure

### GKE Cluster
- **Node Count:** 3 nodes
- **Machine Type:** e2-standard-2 (2 vCPU, 8GB RAM)
- **Region:** us-central1
- **Networking:** Private cluster with Cloud NAT

### Database
- **Type:** Cloud SQL PostgreSQL 14
- **Instance Type:** db-f1-micro (for demo)
- **HA:** Single zone (can upgrade to HA)
- **Schemas:** products, orders

### Messaging
- **Kafka:** Deployed via Strimzi operator
- **Brokers:** 1 (single replica for demo)
- **Topics:** 
  - `product-events` (1 partition)
  - `order-events` (1 partition)

## Security Best Practices

### Authentication & Authorization
- Workload Identity for GCP service authentication
- Service-to-service communication via internal DNS
- No public endpoints except LoadBalancer for Frontend

### Network Security
- NetworkPolicies restricting pod-to-pod communication
- Private GKE cluster
- Cloud SQL with private IP only
- VPC peering for database access

### Container Security
- Non-root containers
- Read-only root filesystem where possible
- No privileged containers
- Resource limits on all pods
- Regular security scanning of images

### Secrets Management
- Kubernetes Secrets for sensitive data
- Database credentials rotated regularly
- No secrets in code or version control

## Observability Strategy

### Phase 1: Application Metrics (Built-in)
- Health check endpoints
- Prometheus metrics endpoints
- Structured logging (JSON format)
- Request/response logging

### Phase 2: Dash0 Instrumentation (Post-deployment)
- OpenTelemetry SDK integration
- Distributed tracing across services
- Custom spans for business operations
- Metrics export to Dash0
- Log aggregation

### Key Observability Metrics
- Request rate (requests/second)
- Error rate (errors/total requests)
- Request duration (p50, p95, p99)
- Kafka lag (consumer offset lag)
- Database connection pool usage
- Service dependency graph

## Deployment Strategy

### Infrastructure Provisioning
```bash
cd terraform/environments/dev
terraform init
terraform plan
terraform apply
```

### Service Deployment
```bash
# Build images
./scripts/build-images.sh

# Push to GCR
./scripts/push-images.sh

# Deploy to GKE
kubectl apply -f k8s/base/
```

### Testing
```bash
# Port forward to frontend
kubectl port-forward svc/frontend 8080:80

# Access application
open http://localhost:8080
```

## Scalability Considerations

### Horizontal Scaling
- Product Service: 2-5 replicas
- Order Service: 2-5 replicas
- Load Generator: 1 replica
- Frontend: 2-3 replicas

### Database Scaling
- Connection pooling (10-20 connections per service)
- Read replicas for read-heavy workloads
- Partitioning for large tables

### Kafka Scaling
- Increase partitions for higher throughput
- Add brokers for redundancy
- Consumer groups for parallel processing

## Cost Optimization

### Development/Demo
- Single-zone GKE cluster
- e2-standard-2 nodes (preemptible for cost savings)
- db-f1-micro Cloud SQL instance
- Minimal replica counts

### Production (Future)
- Multi-zone HA cluster
- Larger node types
- Cloud SQL HA configuration
- Horizontal Pod Autoscaling
- Cluster Autoscaler

## Future Enhancements

1. **API Gateway:** Kong or Cloud Endpoints
2. **Caching Layer:** Redis for frequently accessed data
3. **CDN:** Cloud CDN for static assets
4. **CI/CD Pipeline:** GitHub Actions or Cloud Build
5. **Service Mesh:** Istio for advanced traffic management
6. **Advanced Observability:** Grafana, Jaeger, ELK stack

## Development Workflow

1. **Local Development:** Docker Compose for local testing
2. **Feature Branch:** Develop features in separate branches
3. **Build:** Build Docker images
4. **Push:** Push to GCR
5. **Deploy:** Deploy to GKE dev environment
6. **Test:** Verify functionality
7. **Merge:** Merge to main branch
8. **Production:** Manual promotion to production

## Disaster Recovery

### Backup Strategy
- Cloud SQL automated backups (daily)
- Point-in-time recovery (7 days)
- Terraform state in GCS with versioning

### Recovery Procedures
- Database restore from backup
- Terraform state recovery
- Service redeployment from GCR images

## Monitoring & Alerts

### Key Alerts (Post-Dash0 Integration)
- Service down (health check failures)
- High error rate (>5%)
- High latency (p95 > 1000ms)
- Database connection pool exhaustion
- Kafka consumer lag (>1000 messages)
- Pod restart loops

## Documentation

- `README.md` - Getting started guide
- `ARCHITECTURE.md` - This document
- `terraform/README.md` - Infrastructure documentation
- `services/*/README.md` - Service-specific documentation
- `k8s/README.md` - Kubernetes deployment guide

## Team Contacts

- **Project Owner:** Ryan Peirce (ryan.j.peirce@gmail.com)
- **GCP Project:** willful-waste
- **GitHub Repo:** https://github.com/ryan-peirce/willful-waste.git
