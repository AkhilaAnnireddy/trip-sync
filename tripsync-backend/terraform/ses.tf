# SES Email Identity
resource "aws_ses_email_identity" "tripsync" {
  email = var.ses_from_email
}

# SES Configuration Set
resource "aws_ses_configuration_set" "tripsync" {
  name = "${var.project_name}-configuration-set"
}

# CloudWatch Event Destination for SES
resource "aws_ses_event_destination" "cloudwatch" {
  name                   = "cloudwatch-destination"
  configuration_set_name = aws_ses_configuration_set.tripsync.name
  enabled                = true
  matching_types         = ["send", "reject", "bounce", "complaint", "delivery"]

  cloudwatch_destination {
    default_value  = "default"
    dimension_name = "ses:configuration-set"
    value_source   = "messageTag"
  }
}