# Copy this file to terraform.tfvars and fill in your values
# DO NOT commit terraform.tfvars to git (it's in .gitignore)

aws_region    = "us-east-1"
environment   = "production"
project_name  = "tripsync"

# Database Configuration
db_name     = "tripsync_db"
db_username = "tripsync_user"
db_password = "CHANGE_ME_STRONG_PASSWORD"  # Use a strong password

# JWT Configuration
jwt_secret = "CHANGE_ME_256_BIT_SECRET_KEY"  # Must be at least 256 bits

# SES Configuration
ses_from_email = "your-verified-email@example.com"  # Must verify this in AWS SES

# Security
allowed_ssh_cidr = "YOUR_IP_ADDRESS/32"  # Change to your IP for security

# Instance Types (Free Tier)
instance_type      = "t2.micro"
db_instance_class  = "db.t3.micro"