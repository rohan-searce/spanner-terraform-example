cloud_run_service_name       = "omegatrade-03"
backend_container_image_path = "gcr.io/searce-academy/angular-cloudrun:v1"
cloud_run_region             = "us-west1"
cloud_run_env_var = {
  "INSTANCE"   = "<enter-spanner-instance-id>",
  "DATABASE"   = "<enter-spanner-database-name>",
  "EXPIRE_IN"  = "2d",
  "JWT_SECRET" = "w54p3Y?4dj%8Xqa2jjVC84narhe5Pk",
  "PROJECTID"  = "<enter-your-project-id>"
}
project = "searce-academy"