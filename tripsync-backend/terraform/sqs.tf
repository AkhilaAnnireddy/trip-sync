# SQS Queue for notifications
resource "aws_sqs_queue" "tripsync_notifications" {
  name                       = "${var.project_name}-notifications-queue"
  delay_seconds              = 0
  max_message_size           = 262144  # 256 KB
  message_retention_seconds  = 345600  # 4 days
  receive_wait_time_seconds  = 10      # Long polling
  visibility_timeout_seconds = 30

  tags = {
    Name = "${var.project_name}-notifications-queue"
  }
}

# Dead Letter Queue (DLQ)
resource "aws_sqs_queue" "tripsync_notifications_dlq" {
  name                       = "${var.project_name}-notifications-dlq"
  message_retention_seconds  = 1209600  # 14 days

  tags = {
    Name = "${var.project_name}-notifications-dlq"
  }
}

# Redrive policy for main queue
resource "aws_sqs_queue_redrive_policy" "notifications" {
  queue_url = aws_sqs_queue.tripsync_notifications.id

  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.tripsync_notifications_dlq.arn
    maxReceiveCount     = 3
  })
}