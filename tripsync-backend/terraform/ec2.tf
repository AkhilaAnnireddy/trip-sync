# Get latest Amazon Linux 2 AMI
data "aws_ami" "amazon_linux_2" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["amzn2-ami-hvm-*-x86_64-gp2"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# EC2 Instance
resource "aws_instance" "tripsync_backend" {
  ami           = data.aws_ami.amazon_linux_2.id
  instance_type = var.instance_type

  subnet_id                   = aws_subnet.public_1.id
  vpc_security_group_ids      = [aws_security_group.ec2.id]
  associate_public_ip_address = true

  iam_instance_profile = aws_iam_instance_profile.ec2_profile.name

  user_data = templatefile("${path.module}/user_data.sh", {
    db_endpoint     = aws_db_instance.tripsync_db.endpoint
    db_name         = var.db_name
    db_username     = var.db_username
    db_password     = var.db_password
    jwt_secret      = var.jwt_secret
    sqs_queue_url   = aws_sqs_queue.tripsync_notifications.url
    ses_from_email  = var.ses_from_email
    aws_region      = var.aws_region
  })

  root_block_device {
    volume_size = 8  # Free tier includes 30 GB
    volume_type = "gp2"
  }

  tags = {
    Name = "${var.project_name}-backend"
  }

  depends_on = [
    aws_db_instance.tripsync_db,
    aws_sqs_queue.tripsync_notifications
  ]
}

# Elastic IP (optional - for stable IP)
resource "aws_eip" "backend" {
  instance = aws_instance.tripsync_backend.id
  domain   = "vpc"

  tags = {
    Name = "${var.project_name}-eip"
  }
}