#!/bin/bash
set -e

# Update system
yum update -y

# Install Java 17
amazon-linux-extras enable corretto17
yum install -y java-17-amazon-corretto-devel

# Install Docker
yum install -y docker
systemctl start docker
systemctl enable docker
usermod -aG docker ec2-user

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Install CloudWatch agent
wget https://s3.amazonaws.com/amazoncloudwatch-agent/amazon_linux/amd64/latest/amazon-cloudwatch-agent.rpm
rpm -U ./amazon-cloudwatch-agent.rpm

# Create application directory
mkdir -p /opt/tripsync
cd /opt/tripsync

# Create application.properties file
cat > application.properties <<EOF
spring.datasource.url=jdbc:postgresql://${db_endpoint}/${db_name}
spring.datasource.username=${db_username}
spring.datasource.password=${db_password}
spring.jpa.hibernate.ddl-auto=validate
spring.flyway.enabled=true

jwt.secret=${jwt_secret}
jwt.expiration=86400000

aws.region=${aws_region}
aws.sqs.queue-url=${sqs_queue_url}
aws.ses.from-email=${ses_from_email}

logging.level.com.tripsync=INFO
server.port=8080
EOF

# Create systemd service
cat > /etc/systemd/system/tripsync.service <<EOF
[Unit]
Description=TripSync Backend Service
After=network.target

[Service]
Type=simple
User=ec2-user
WorkingDirectory=/opt/tripsync
ExecStart=/usr/bin/java -jar /opt/tripsync/app.jar --spring.config.location=file:/opt/tripsync/application.properties
SuccessExitStatus=143
TimeoutStopSec=10
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

# Create deployment script
cat > /opt/tripsync/deploy.sh <<'EOF'
#!/bin/bash
set -e

echo "Stopping application..."
systemctl stop tripsync || true

echo "Downloading latest build..."
# This will be replaced by GitHub Actions deployment
# For now, you'll manually upload the JAR

echo "Starting application..."
systemctl start tripsync
systemctl enable tripsync

echo "Deployment complete!"
EOF

chmod +x /opt/tripsync/deploy.sh

# Create log directory
mkdir -p /var/log/tripsync
chown ec2-user:ec2-user /var/log/tripsync

echo "EC2 setup complete! Ready for application deployment."