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
        if [ ! -f "backend-nodejs/.env" ]; then
            cp backend-nodejs/.env.example backend-nodejs/.env
            echo "✅ Created backend-nodejs/.env from example"
        fi
        
        if [ ! -f "frontend/.env" ]; then
            cp frontend/.env.example frontend/.env
            echo "✅ Created frontend/.env from example"
        fi
        
        # Start database
        echo "🐘 Starting PostgreSQL database..."
        cd backend-nodejs
        docker-compose up -d postgres
        
        # Wait for database to be ready
        echo "⏳ Waiting for database to be ready..."
        sleep 10
        
        # Install backend dependencies
        echo "📦 Installing backend dependencies..."
        npm install
        
        # Run migrations
        echo "🗄️ Running database migrations..."
        npm run migrate
        
        # Install frontend dependencies
        echo "📦 Installing frontend dependencies..."
        cd ../frontend
        npm install
        
        echo "✅ Development environment setup complete!"
        echo "🔗 Backend: http://localhost:8080"
        echo "🔗 Frontend: http://localhost:5173"
        echo ""
        echo "To start the services:"
        echo "Backend: cd backend-nodejs && npm run dev"
        echo "Frontend: cd frontend && npm run dev"
        ;;
        
    "production")
        echo "🏭 Setting up production environment..."
        
        # Check if production env files exist
        if [ ! -f "backend-nodejs/.env.production" ]; then
            echo "❌ backend-nodejs/.env.production not found!"
            echo "Please create backend-nodejs/.env.production file first"
            exit 1
        fi
        
        if [ ! -f "frontend/.env.production" ]; then
            echo "❌ frontend/.env.production not found!"
            echo "Please create frontend/.env.production file first"
            exit 1
        fi
        
        # Copy production env files
        cp backend-nodejs/.env.production backend-nodejs/.env
        cp frontend/.env.production frontend/.env
        
        # Install and build backend
        echo "� Installing backend dependencies..."
        cd backend-nodejs
        npm install --production
        
        # Run migrations
        echo "🗄️ Running database migrations..."
        npm run migrate
        
        # Install and build frontend
        echo "📦 Building frontend..."
        cd ../frontend
        npm install
        npm run build
        
        echo "✅ Production build complete!"
        echo "🔗 To start backend: cd backend-nodejs && npm start"
        echo "🔗 To serve frontend: cd frontend && npm run preview"
        ;;
        
    "docker")
        echo "🐳 Setting up Docker environment..."
        
        # Use docker environment file
        if [ ! -f ".env.docker" ]; then
            echo "❌ .env.docker not found! Creating from example..."
            cp backend-nodejs/.env.example .env.docker
        fi
        
        # Deploy with docker compose
        cd backend-nodejs
        docker-compose up -d --build
        
        echo "✅ Docker deployment complete!"
        echo "🔗 Backend API: http://localhost:8080"
        echo "� Database: localhost:5432"
        echo ""
        echo "To deploy frontend separately:"
        echo "cd frontend && docker build -t inventory-frontend . && docker run -p 5173:5173 inventory-frontend"
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
echo "1. Check application logs: docker-compose logs -f (for docker)"
echo "2. Access the application at the URLs shown above"
echo "3. Monitor system resources and performance"
