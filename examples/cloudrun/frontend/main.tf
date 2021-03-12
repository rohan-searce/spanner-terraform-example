resource "random_string" "launch_id" {
  length  = 4
  special = false
  upper   = false
}

locals {
  suffix = format("%s-%s", "tf", random_string.launch_id.result)
}

module "cloud_run_frontend" {
  source               = "../../../modules/cloudrun"
  suffix               = local.suffix
  service_name         = "omegatrade-frontend"
  container_image_path = "gcr.io/[project-id]/frontend/path:tag"
  region               = "us-west1"
}
