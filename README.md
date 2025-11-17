# Willful Waste

A cloud-native e-commerce demo showcasing microservices architecture 

## 📊 Architecture

**Services:**
- 🎨 **Frontend** - React web interface
- 📦 **Product Service** - Java/Spring Boot catalog service (auto-populates 8 products)
- 🛒 **Order Service** - Node.js/Express order processing
- 🔄 **Load Generator** - Python traffic simulator
- ⚡ **Kafka** - Event streaming (Strimzi)
- 🗄️ **Cloud SQL** - Managed PostgreSQL database

**Infrastructure:**
- Google Kubernetes Engine (GKE) - 3-node cluster
- Cloud SQL for PostgreSQL - Managed database
- Google Container Registry - Container images
- Terraform - Infrastructure as Code

## 📁 Project Structure

```
willful-waste/
├── terraform/              # Infrastructure as Code
│   ├── modules/
│   │   ├── networking/     # VPC, subnets, firewall
│   │   ├── gke/            # Kubernetes cluster
│   │   └── database/       # Cloud SQL PostgreSQL
│   └── main.tf
├── services/
│   ├── frontend/           # React web app
│   ├── product-service/    # Java/Spring Boot
│   ├── order-service/      # Node.js/Express
│   └── load-generator/     # Python traffic simulator
├── k8s/                    # Kubernetes manifests
│   ├── frontend/
│   ├── product-service/
│   ├── order-service/
│   ├── load-generator/
│   └── kafka/
└── scripts/
    ├── build-images.sh
    └── push-images.sh
```