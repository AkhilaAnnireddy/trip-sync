# TripSync

A cloud-native trip coordination platform that enables collaborative trip planning, task management, and shared expense tracking.

## Overview

TripSync is a microservices-based platform designed to help groups coordinate travel plans efficiently. The application provides real-time collaboration features, geospatial visualization, and asynchronous event-driven communication to ensure a seamless user experience.

## Key Features

- **Collaborative Trip Planning**: Create and manage trips with multiple participants
- **Task Management**: Kanban-style task boards for organizing trip-related activities
- **Expense Tracking**: Shared expense management with automatic calculations
- **Geospatial Visualization**: Interactive map integration using Mapbox for trip route planning
- **Real-time Notifications**: Event-driven email notifications via AWS SES
- **Secure Authentication**: JWT-based authentication and authorization

## Architecture

TripSync follows a microservices architecture pattern with the following components:

- **Backend Services**: Java Spring Boot microservices deployed on AWS EC2
- **Database**: PostgreSQL hosted on AWS RDS
- **Message Queue**: AWS SQS for asynchronous service communication
- **Notification Service**: Dedicated service using AWS SES for email delivery
- **Frontend**: React-based single-page application with Mapbox integration
- **Infrastructure**: Terraform for infrastructure as code
- **Monitoring**: AWS CloudWatch for centralized logging and monitoring

## Technology Stack

### Backend

- Java
- Spring Boot
- PostgreSQL
- JWT Authentication

### Cloud Infrastructure

- AWS EC2
- AWS RDS
- AWS SQS
- AWS SES
- AWS CloudWatch
- Terraform

### Frontend

- React
- Mapbox GL JS

## Getting Started

### Prerequisites

- Java 11 or higher
- Node.js 14 or higher
- PostgreSQL 12 or higher
- AWS Account
- Terraform 1.0 or higher

### Installation

1. Clone the repository

```bash
git clone https://github.com/AkhilaAnnireddy/TripSync.git
cd TripSync
```

2. Configure environment variables

```bash
# Create .env file with the following variables
DATABASE_URL=your_database_url
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
JWT_SECRET=your_jwt_secret
MAPBOX_TOKEN=your_mapbox_token
```

3. Deploy infrastructure using Terraform

```bash
cd terraform
terraform init
terraform plan
terraform apply
```

4. Build and run backend services

```bash
cd backend
./mvnw clean install
./mvnw spring-boot:run
```

5. Start the frontend application

```bash
cd frontend
npm install
npm start
```

## Architecture Diagram

The platform uses an event-driven microservices architecture where services communicate asynchronously through AWS SQS. The Notification Service subscribes to events and sends emails via AWS SES, ensuring decoupled and reliable communication.

## Deployment

The application is deployed entirely within AWS Free Tier limits:

- Backend services on AWS EC2 instances
- PostgreSQL database on AWS RDS
- Message queue and email service using AWS SQS and SES
- Infrastructure provisioned and managed through Terraform
- Centralized logging via AWS CloudWatch
