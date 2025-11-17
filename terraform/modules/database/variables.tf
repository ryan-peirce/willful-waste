variable "project_id" {
  description = "GCP Project ID"
  type        = string
}

variable "region" {
  description = "GCP Region"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "instance_name" {
  description = "Cloud SQL instance name"
  type        = string
}

variable "database_version" {
  description = "PostgreSQL version"
  type        = string
}

variable "tier" {
  description = "Cloud SQL instance tier"
  type        = string
}

variable "network_id" {
  description = "VPC network ID"
  type        = string
}

variable "private_vpc_connection" {
  description = "Private VPC connection for Cloud SQL"
  type        = string
}
