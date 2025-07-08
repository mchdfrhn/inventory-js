#!/bin/bash

# Deploy script for STTPU Inventory Backend

set -e

echo "🚀 Starting deployment process..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker first.${NC}"
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ docker-compose is not installed.${NC}"
    exit 1
fi

# Environment setup
echo -e "${YELLOW}📋 Setting up environment...${NC}"
if [ ! -f .env ]; then
    cp .env.example .env
    echo -e "${GREEN}✅ Created .env file from .env.example${NC}"
    echo -e "${YELLOW}⚠️  Please review and update .env file with your configuration${NC}"
fi

# Build and start services
echo -e "${YELLOW}🔨 Building and starting services...${NC}"
docker-compose down --remove-orphans
docker-compose build --no-cache
docker-compose up -d

# Wait for services to be ready
echo -e "${YELLOW}⏳ Waiting for services to be ready...${NC}"
sleep 10

# Check if backend is healthy
echo -e "${YELLOW}🔍 Checking backend health...${NC}"
max_attempts=30
attempt=1

while [ $attempt -le $max_attempts ]; do
    if curl -f http://localhost:8080/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend is healthy!${NC}"
        break
    else
        echo -e "${YELLOW}⏳ Waiting for backend... (attempt $attempt/$max_attempts)${NC}"
        sleep 5
        ((attempt++))
    fi
done

if [ $attempt -gt $max_attempts ]; then
    echo -e "${RED}❌ Backend health check failed. Please check logs.${NC}"
    docker-compose logs backend
    exit 1
fi

# Run migrations
echo -e "${YELLOW}🗃️  Running database migrations...${NC}"
docker-compose exec backend npm run migrate

# Optionally seed database
read -p "Do you want to seed the database with sample data? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}🌱 Seeding database...${NC}"
    docker-compose exec backend npm run seed
fi

# Show service status
echo -e "${YELLOW}📊 Service status:${NC}"
docker-compose ps

# Show useful information
echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo ""
echo -e "${GREEN}📋 Service URLs:${NC}"
echo -e "  Backend API: http://localhost:8080"
echo -e "  Health Check: http://localhost:8080/health"
echo -e "  API Documentation: http://localhost:8080/api/v1"
echo ""
echo -e "${GREEN}🔧 Useful commands:${NC}"
echo -e "  View logs: docker-compose logs -f"
echo -e "  Stop services: docker-compose down"
echo -e "  Restart services: docker-compose restart"
echo -e "  View backend logs: docker-compose logs -f backend"
echo ""
echo -e "${YELLOW}⚠️  Don't forget to:${NC}"
echo -e "  1. Update .env file with production values"
echo -e "  2. Configure SSL certificates for production"
echo -e "  3. Set up backup strategy for database"
echo -e "  4. Configure monitoring and alerting"
