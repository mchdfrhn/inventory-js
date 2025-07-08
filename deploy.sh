#!/bin/bash

# STTPU Inventory System Deployment Script
# Usage: ./deploy.sh [environment]
# Environment: development, production, docker

set -e

ENVIRONMENT=${1:-development}
PROJECT_NAME="STTPU Inventory System"

echo "🚀 Starting deployment for $PROJECT_NAME"
echo "📦 Environment: $ENVIRONMENT"
echo "=================================="

case $ENVIRONMENT in
    "development")
        echo "🔧 Setting up development environment..."
        
        # Copy environment files
        if [ ! -f "backend/.env" ]; then
            cp backend/.env.example backend/.env || cp .env.example backend/.env
            echo "✅ Created backend/.env from example"
        fi
        
        if [ ! -f "frontend/.env" ]; then
            cp frontend/.env.example frontend/.env || cp .env.example frontend/.env
            echo "✅ Created frontend/.env from example"
        fi
        
        # Start database
        echo "🐘 Starting PostgreSQL database..."
        cd backend
        docker-compose up -d postgres
        
        # Wait for database to be ready
        echo "⏳ Waiting for database to be ready..."
        sleep 10
        
        # Run migrations
        echo "🗄️ Running database migrations..."
        go run cmd/migrate/main.go
        
        # Install frontend dependencies
        echo "📦 Installing frontend dependencies..."
        cd ../frontend
        npm install
        
        echo "✅ Development environment setup complete!"
        echo "🔗 Backend: http://localhost:8080"
        echo "🔗 Frontend: http://localhost:5173"
        echo ""
        echo "To start the services:"
        echo "Backend: cd backend && go run cmd/main.go"
        echo "Frontend: cd frontend && npm run dev"
        ;;
        
    "production")
        echo "🏭 Setting up production environment..."
        
        # Check if production env files exist
        if [ ! -f "backend/.env.production" ]; then
            echo "❌ backend/.env.production not found!"
            echo "Please create backend/.env.production file first"
            exit 1
        fi
        
        if [ ! -f "frontend/.env.production" ]; then
            echo "❌ frontend/.env.production not found!"
            echo "Please create frontend/.env.production file first"
            exit 1
        fi
        
        # Copy production env files
        cp backend/.env.production backend/.env
        cp frontend/.env.production frontend/.env
        
        # Build and deploy with docker
        echo "🐳 Building and deploying with Docker..."
        docker-compose -f docker-compose.full.yml --env-file .env.docker up -d --build
        
        echo "✅ Production deployment complete!"
        echo "🔗 Application: http://localhost:3000"
        ;;
        
    "docker")
        echo "🐳 Setting up Docker environment..."
        
        # Use docker environment file
        if [ ! -f ".env.docker" ]; then
            echo "❌ .env.docker not found!"
            exit 1
        fi
        
        # Deploy with docker compose
        docker-compose -f docker-compose.full.yml --env-file .env.docker up -d --build
        
        echo "✅ Docker deployment complete!"
        echo "🔗 Application: http://localhost:3000"
        echo "🔗 API: http://localhost:8080"
        echo "🐘 Database: localhost:5432"
        ;;
        
    *)
        echo "❌ Unknown environment: $ENVIRONMENT"
        echo "Available environments: development, production, docker"
        exit 1
        ;;
esac

echo ""
echo "🎉 Deployment completed successfully!"
echo "📋 Next steps:"
echo "1. Check application logs: docker-compose logs -f"
echo "2. Access the application at the URLs shown above"
echo "3. Monitor system resources and performance"
