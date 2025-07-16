#!/bin/bash

# STTPU Inventory System Deployment Script
# Usage: ./deploy.sh [environment]
# Environment: dev    "docker")
        echo "🐳 Manual database setup required..."
        echo "❌ Docker support not available in this project"
        echo ""
        echo "Please use 'development' or 'production' environment"
        echo "Make sure PostgreSQL is installed and running manually"
        exit 1
        ;;, docker

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
        
        # Check if PostgreSQL is running
        echo "🐘 Checking PostgreSQL database..."
        if ! command -v psql &> /dev/null; then
            echo "❌ PostgreSQL not found! Please install PostgreSQL first"
            exit 1
        fi
        
        # Check if database exists
        if ! psql -U postgres -lqt | cut -d \| -f 1 | grep -qw inventaris; then
            echo "📊 Creating database..."
            createdb inventaris
            echo "✅ Database 'inventaris' created"
        else
            echo "✅ Database 'inventaris' already exists"
        fi
        
        # Install backend dependencies
        echo "📦 Installing backend dependencies..."
        cd backend-nodejs
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
        echo "Available environments: development, production"
        exit 1
        ;;
esac

echo ""
echo "🎉 Deployment completed successfully!"
echo "📋 Next steps:"
echo "1. Start the backend and frontend services"
echo "2. Access the application at the URLs shown above"
echo "3. Monitor system resources and performance"
