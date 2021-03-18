resource "random_string" "launch_id" {
  length  = 4
  special = false
  upper   = false
}

locals {
  suffix = format("%s-%s", "tf", random_string.launch_id.result)
}

module omegatrade {
  source           = "../../modules/gce"
  suffix           = local.suffix
  region           = var.gce_region
  zone             = var.gce_zone
  vpc_network_name = var.vpc_network_name
  instance_name    = var.gce_instance_name
  network_tags     = var.gce_network_tags
}
