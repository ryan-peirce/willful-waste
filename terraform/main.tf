terraform {
  required_version = ">= 1.5.0"
  
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }

  backend "gcs" {
    bucket = "willful-waste-terraform-state"
    prefix = "terraform/state"
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

# Enable required GCP APIs
resource "google_project_service" "compute" {
  service            = "compute.googleapis.com"
  disable_on_destroy = false
}

resource "google_project_service" "container" {
  service            = "container.googleapis.com"
  disable_on_destroy = false
}

resource "google_project_service" "sqladmin" {
  service            = "sqladmin.googleapis.com"
  disable_on_destroy = false
}

resource "google_project_service" "servicenetworking" {
  service            = "servicenetworking.googleapis.com"
  disable_on_destroy = false
}

# Networking Module
module "networking" {
  source = "./modules/networking"

  project_id  = var.project_id
  region      = var.region
  environment = var.environment

  depends_on = [
    google_project_service.compute,
    google_project_service.servicenetworking
  ]
}

# GKE Module
module "gke" {
  source = "./modules/gke"

  project_id   = var.project_id
  region       = var.region
  zone         = var.zone
  cluster_name = var.cluster_name
  environment  = var.environment
  node_count   = var.node_count
  machine_type = var.machine_type
  
  network_name    = module.networking.network_name
  subnet_name     = module.networking.subnet_name

  depends_on = [
    google_project_service.container,
    module.networking
  ]
}

# Database Module
module "database" {
  source = "./modules/database"

  project_id       = var.project_id
  region           = var.region
  environment      = var.environment
  instance_name    = var.db_instance_name
  database_version = var.db_version
  tier             = var.db_tier
  
  network_id              = module.networking.network_id
  private_vpc_connection  = module.networking.private_vpc_connection

  depends_on = [
    google_project_service.sqladmin,
    module.networking
  ]
}
