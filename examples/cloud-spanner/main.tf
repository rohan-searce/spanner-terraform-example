resource "random_string" "launch_id" {
  length  = 4
  special = false
  upper   = false
}

locals {
  suffix = format("%s-%s", "tf", random_string.launch_id.result)
}

module omegatrade {
  source      = "../../modules/cloud-spanner"
  suffix      = local.suffix
  instance_id = var.spanner_instance_id
  dbname      = var.spanner_dbname
  config      = var.spanner_config
  num_nodes   = var.spanner_nodes
  labels_var  = var.spanner_labels
}
