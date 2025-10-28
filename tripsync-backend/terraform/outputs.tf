output "ec2_public_ip" {
  description = "Public IP of EC2 instance"
  value       = aws_instance.tripsync_backend.public_ip
}

output "ec2_public_dns" {
  description = "Public DNS of EC2 instance"
  value       = aws_instance.tripsync_backend.public_dns
}

output "rds_endpoint" {
  description = "RDS instance endpoint"
  value       = aws_db_instance.tripsync_db.endpoint
  sensitive   = true
}

output "rds_database_name" {
  description = "RDS database name"
  value       = aws_db_instance.tripsync_db.db_name
}

output "sqs_queue_url" {
  description = "SQS queue URL"
  value       = aws_sqs_queue.tripsync_notifications.url
}

output "sqs_queue_arn" {
  description = "SQS queue ARN"
  value       = aws_sqs_queue.tripsync_notifications.arn
}

output "application_url" {
  description = "Application URL"
  value       = "http://${aws_instance.tripsync_backend.public_ip}:8080"
}