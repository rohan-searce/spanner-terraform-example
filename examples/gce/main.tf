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
  region           = var.region
  vpc_network_name = "main-vpc"
  instance_name    = "spanner-emulator"
  network_tags     = ["http-server", "https-server", "ssh"]
}
