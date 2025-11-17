# Terraform Infrastructure

This directory contains Terraform code to provision the infrastructure for the Willful Waste application on Google Cloud Platform.

## Prerequisites

1. **GCP Project**: Ensure you have a GCP project (`willful-waste`)
2. **gcloud CLI**: Authenticated and configured
3. **Terraform**: Version 1.5.0 or higher
4. **Permissions**: Project Editor or Owner role

## Architecture

The infrastructure includes:

- **VPC Network**: Custom VPC with private subnets
- **GKE Cluster**: 3-node Kubernetes cluster
- **Cloud SQL**: PostgreSQL 14 instance with private IP
- **Cloud NAT**: For outbound internet access from private cluster
- **Service Networking**: VPC peering for Cloud SQL

## Directory Structure

```
terraform/
├── main.tf              # Main configuration
├── variables.tf         # Global variables
├── outputs.tf          # Output values
├── modules/
│   ├── networking/     # VPC, subnets, firewall rules
│   ├── gke/           # GKE cluster configuration
│   └── database/      # Cloud SQL PostgreSQL
└── README.md          # This file
```

## Setup Instructions

### 1. Create GCS Bucket for Terraform State

First, create a GCS bucket to store Terraform state:

```bash
gsutil mb -p willful-waste -l us-central1 gs://willful-waste-terraform-state
gsutil versioning set on gs://willful-waste-terraform-state
```

### 2. Enable Required APIs

Enable necessary GCP APIs (this is also done automatically by Terraform):

```bash
gcloud services enable compute.googleapis.com
gcloud services enable container.googleapis.com
gcloud services enable sqladmin.googleapis.com
gcloud services enable servicenetworking.googleapis.com
```

### 3. Initialize Terraform

```bash
cd terraform
terraform init
```

### 4. Review the Plan

```bash
terraform plan
```

### 5. Apply the Configuration

```bash
terraform apply
```

This will create:
- VPC network with subnets
- 3-node GKE cluster (takes ~10-15 minutes)
- Cloud SQL PostgreSQL instance (takes ~5-10 minutes)
- Networking components (NAT, firewall rules)

### 6. Configure kubectl

After successful apply, configure kubectl to access the cluster:

```bash
gcloud container clusters get-credentials willful-waste-cluster \
  --zone=us-central1-a \
  --project=willful-waste
```

Or use the output command:

```bash
terraform output -raw configure_kubectl | bash
```

### 7. Verify Cluster Access

```bash
kubectl get nodes
kubectl get namespaces
```

## Variables

Key variables can be customized in `variables.tf`:

| Variable | Default | Description |
|----------|---------|-------------|
| project_id | willful-waste | GCP Project ID |
| region | us-central1 | GCP Region |
| zone | us-central1-a | GCP Zone |
| cluster_name | willful-waste-cluster | GKE cluster name |
| node_count | 3 | Number of nodes |
| machine_type | e2-standard-2 | Node machine type |
| db_tier | db-f1-micro | Database instance tier |

## Outputs

After applying, Terraform outputs:

- `gke_cluster_name`: Name of the GKE cluster
- `gke_cluster_endpoint`: Cluster API endpoint
- `database_connection_name`: Cloud SQL connection name
- `database_private_ip`: Database private IP address
- `configure_kubectl`: Command to configure kubectl

View outputs:

```bash
terraform output
```

## Database Connection

The Cloud SQL instance is configured with:

- **Instance Name**: willful-waste-db
- **Version**: PostgreSQL 14
- **Databases**: `products`, `orders`
- **User**: appuser (password in outputs)
- **Connection**: Private IP only (no public IP)

To get the database password:

```bash
terraform output -raw db_password
```

To create a Kubernetes secret for database access:

```bash
kubectl create secret generic db-credentials \
  --from-literal=username=appuser \
  --from-literal=password=$(terraform output -raw db_password) \
  --from-literal=host=$(terraform output -raw database_private_ip) \
  --from-literal=database=products
```

## Cost Estimates

**Daily costs (approximate)**:
- GKE Cluster (3 x e2-standard-2): ~$4.00
- Cloud SQL (db-f1-micro): ~$0.50
- Networking: ~$0.10
- **Total**: ~$4.60/day (~$140/month)

**Cost Optimization Tips**:
- Use preemptible nodes for dev environments
- Stop/delete cluster when not in use
- Use smaller database tier (db-f1-micro)
- Enable cluster autoscaling

## Maintenance

### Update Cluster

```bash
terraform plan
terraform apply
```

### Scale Node Pool

Edit `variables.tf` and change `node_count`, then:

```bash
terraform apply
```

### Destroy Infrastructure

⚠️ **Warning**: This will delete all resources!

```bash
terraform destroy
```

## Troubleshooting

### Issue: Terraform state locked

```bash
# Force unlock (use with caution)
terraform force-unlock <lock-id>
```

### Issue: API not enabled

Enable the required API manually:

```bash
gcloud services enable <api-name>
```

### Issue: Insufficient permissions

Ensure your account has necessary IAM roles:
- Compute Admin
- Kubernetes Engine Admin
- Cloud SQL Admin
- Service Networking Admin

### Issue: Quota exceeded

Check and request quota increases:

```bash
gcloud compute project-info describe --project=willful-waste
```

## Security Considerations

- ✅ Private GKE cluster (no public endpoint)
- ✅ Private Cloud SQL (no public IP)
- ✅ VPC peering for secure database access
- ✅ Workload Identity enabled
- ✅ Network policies enabled
- ✅ Shielded GKE nodes
- ✅ Automated backups enabled

## Next Steps

After infrastructure is provisioned:

1. Deploy Kafka using Strimzi operator
2. Build and push Docker images
3. Deploy microservices to GKE
4. Configure application secrets
5. Test application functionality
6. Add observability with Dash0

## References

- [Terraform GCP Provider](https://registry.terraform.io/providers/hashicorp/google/latest/docs)
- [GKE Documentation](https://cloud.google.com/kubernetes-engine/docs)
- [Cloud SQL Documentation](https://cloud.google.com/sql/docs)
