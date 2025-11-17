# Kubernetes Deployment Guide

This directory contains Kubernetes manifests for deploying the Willful Waste application to GKE.

## Prerequisites

1. **GKE Cluster**: Cluster created via Terraform
2. **kubectl**: Configured to access the cluster
3. **Docker Images**: Built and pushed to GCR
4. **Database**: Cloud SQL instance running

## Deployment Order

### 1. Deploy Strimzi Operator (Kafka)

```bash
# Install Strimzi operator
kubectl create namespace kafka
kubectl create -f 'https://strimzi.io/install/latest?namespace=kafka' -n kafka

# Wait for operator to be ready
kubectl wait --for=condition=Ready pod -l name=strimzi-cluster-operator -n kafka --timeout=300s

# Deploy Kafka cluster
kubectl apply -f k8s/kafka/
```

### 2. Create Database Secret

Get database password from Terraform:

```bash
cd terraform
DB_PASSWORD=$(terraform output -raw db_password)
DB_HOST=$(terraform output -raw database_private_ip)
cd ..

# Create secret
kubectl create secret generic db-credentials \
  --from-literal=username=appuser \
  --from-literal=password=$DB_PASSWORD \
  --from-literal=host=$DB_HOST \
  --from-literal=products-db=products \
  --from-literal=orders-db=orders
```

### 3. Deploy Services

```bash
# Deploy all services
kubectl apply -f k8s/product-service/
kubectl apply -f k8s/order-service/
kubectl apply -f k8s/load-generator/
```

### 4. Verify Deployment

```bash
# Check all pods
kubectl get pods

# Check services
kubectl get services

# Check logs
kubectl logs -l app=product-service --tail=50
kubectl logs -l app=order-service --tail=50
kubectl logs -l app=load-generator --tail=50
```

## Service URLs

### Internal (ClusterIP)
- Product Service: `http://product-service:8080`
- Order Service: `http://order-service:3000`
- Kafka: `kafka-cluster-kafka-bootstrap.kafka:9092`

### External (if LoadBalancer configured)
```bash
kubectl get svc product-service -o jsonpath='{.status.loadBalancer.ingress[0].ip}'
```

## Kafka Topics

The application uses these topics:
- `product-events` - Product CRUD events
- `order-events` - Order CRUD events

Topics are auto-created by Kafka or can be manually created:

```bash
# List topics
kubectl -n kafka run kafka-producer -ti \
  --image=quay.io/strimzi/kafka:latest-kafka-3.6.0 \
  --rm=true --restart=Never -- \
  bin/kafka-topics.sh --bootstrap-server kafka-cluster-kafka-bootstrap:9092 --list

# Create topic manually
kubectl -n kafka run kafka-producer -ti \
  --image=quay.io/strimzi/kafka:latest-kafka-3.6.0 \
  --rm=true --restart=Never -- \
  bin/kafka-topics.sh --bootstrap-server kafka-cluster-kafka-bootstrap:9092 \
  --create --topic product-events --partitions 1 --replication-factor 1
```

## Scaling

```bash
# Scale product service
kubectl scale deployment product-service --replicas=3

# Scale order service
kubectl scale deployment order-service --replicas=3

# Enable/disable load generator
kubectl scale deployment load-generator --replicas=0  # Disable
kubectl scale deployment load-generator --replicas=1  # Enable
```

## Troubleshooting

### Check Pod Status
```bash
kubectl describe pod <pod-name>
```

### View Logs
```bash
kubectl logs <pod-name> -f
```

### Check Events
```bash
kubectl get events --sort-by='.lastTimestamp'
```

### Database Connection Issues
```bash
# Verify secret exists
kubectl get secret db-credentials

# Test database connection from a pod
kubectl run -it --rm debug --image=postgres:14 --restart=Never -- \
  psql -h <DB_HOST> -U appuser -d products
```

### Kafka Issues
```bash
# Check Kafka cluster status
kubectl get kafka -n kafka

# View Kafka operator logs
kubectl logs -n kafka -l name=strimzi-cluster-operator
```

## Monitoring

### Port Forward to Services

```bash
# Product Service
kubectl port-forward svc/product-service 8080:8080

# Order Service
kubectl port-forward svc/order-service 3000:3000

# Prometheus metrics
kubectl port-forward svc/product-service 8080:8080
curl http://localhost:8080/actuator/prometheus

kubectl port-forward svc/order-service 3000:3000
curl http://localhost:3000/metrics
```

## Cleanup

```bash
# Delete all services
kubectl delete -f k8s/product-service/
kubectl delete -f k8s/order-service/
kubectl delete -f k8s/load-generator/
kubectl delete -f k8s/kafka/

# Delete Strimzi operator
kubectl delete -f 'https://strimzi.io/install/latest?namespace=kafka' -n kafka
kubectl delete namespace kafka

# Delete secrets
kubectl delete secret db-credentials
```

## Configuration Updates

### Update Environment Variables

Edit the ConfigMap and restart pods:

```bash
kubectl edit configmap product-service-config
kubectl rollout restart deployment/product-service
```

### Update Docker Image

```bash
# After building and pushing new image
kubectl set image deployment/product-service \
  product-service=gcr.io/willful-waste/product-service:new-tag

# Or edit deployment
kubectl edit deployment product-service
```

## Security Notes

- Services run as non-root users (UID 1001)
- Network policies restrict pod-to-pod communication
- Secrets are used for sensitive data (database credentials)
- Read-only root filesystems where possible
- Resource limits prevent resource exhaustion

## Next Steps

After deployment is complete:
1. Verify all services are healthy
2. Check load generator is creating traffic
3. Add Dash0 instrumentation
4. Configure observability dashboards
