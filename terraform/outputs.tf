# Outputs

output "gke_cluster_name" {
  description = "GKE cluster name"
  value       = module.gke.cluster_name
}

output "gke_cluster_endpoint" {
  description = "GKE cluster endpoint"
  value       = module.gke.cluster_endpoint
  sensitive   = true
}

output "gke_cluster_ca_certificate" {
  description = "GKE cluster CA certificate"
  value       = module.gke.cluster_ca_certificate
  sensitive   = true
}

output "database_instance_name" {
  description = "Cloud SQL instance name"
  value       = module.database.instance_name
}

output "database_connection_name" {
  description = "Cloud SQL instance connection name"
  value       = module.database.connection_name
}

output "database_private_ip" {
  description = "Cloud SQL private IP address"
  value       = module.database.private_ip_address
}

output "database_name" {
  description = "Database name"
  value       = module.database.database_name
}

output "db_password" {
  description = "Database password"
  value       = module.database.db_password
  sensitive   = true
}

output "network_name" {
  description = "VPC network name"
  value       = module.networking.network_name
}

output "subnet_name" {
  description = "VPC subnet name"
  value       = module.networking.subnet_name
}

output "configure_kubectl" {
  description = "Command to configure kubectl"
  value       = "gcloud container clusters get-credentials ${module.gke.cluster_name} --zone=${var.zone} --project=${var.project_id}"
}
