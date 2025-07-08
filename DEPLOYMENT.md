# STTPU Inventory System - Deployment Guide

Panduan deployment untuk STTPU Inventory Management System dengan berbagai environment.

## 📋 Prerequisites

- Docker & Docker Compose
- Node.js 18+ (untuk development)
- Go 1.21+ (untuk development)
- PostgreSQL (jika tidak menggunakan Docker)

## 🚀 Quick Start

### 1. Clone Repository
```bash
git clone <repository-url>
cd inventory
```

### 2. Setup Environment
```bash
# Copy example environment file
cp .env.example .env

# Edit the environment variables according to your setup
nano .env  # or use your preferred editor
```

### 3. Deploy

#### For Development
```bash
# Linux/Mac
./deploy.sh development

# Windows
deploy.bat development
```

#### For Production
```bash
# Linux/Mac
./deploy.sh production

# Windows
deploy.bat production
```

#### For Docker
```bash
# Linux/Mac
./deploy.sh docker

# Windows
deploy.bat docker
```

## 📁 Environment Files

### Backend Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PORT` | Server port | 8080 | No |
| `GIN_MODE` | Gin mode (debug/release) | debug | No |
| `DB_HOST` | Database host | localhost | Yes |
| `DB_PORT` | Database port | 5432 | No |
| `DB_USER` | Database user | postgres | Yes |
| `DB_PASSWORD` | Database password | postgres | Yes |
| `DB_NAME` | Database name | inventaris | Yes |
| `DB_SSLMODE` | SSL mode | disable | No |
| `JWT_SECRET` | JWT secret key | - | Yes |
| `CORS_ALLOWED_ORIGINS` | Allowed CORS origins | - | No |

### Frontend Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `VITE_API_BASE_URL` | Backend API URL | http://localhost:8080 | Yes |
| `VITE_API_TIMEOUT` | API timeout (ms) | 10000 | No |
| `VITE_APP_NAME` | Application name | STTPU Inventory System | No |
| `VITE_ENABLE_ANALYTICS` | Enable analytics | false | No |
| `VITE_ENABLE_DEBUG` | Enable debug mode | true | No |

## 🔧 Manual Deployment

### Backend Only
```bash
cd backend

# Copy environment file
cp .env.example .env

# Edit environment variables
nano .env

# Start database (if using Docker)
docker-compose up -d postgres

# Run migrations
go run cmd/migrate/main.go

# Start backend
go run cmd/main.go
```

### Frontend Only
```bash
cd frontend

# Copy environment file
cp .env.example .env

# Edit environment variables
nano .env

# Install dependencies
npm install

# Start development server
npm run dev

# Or build for production
npm run build
```

## 🐳 Docker Deployment

### Full Stack with Docker Compose
```bash
# Copy docker environment file
cp .env.example .env.docker

# Edit docker environment variables
nano .env.docker

# Deploy all services
docker-compose -f docker-compose.full.yml --env-file .env.docker up -d --build
```

### Individual Services
```bash
# Database only
docker-compose -f backend/docker-compose.yml up -d

# Backend only
cd backend
docker build -t inventory-backend .
docker run -p 8080:8080 --env-file .env inventory-backend

# Frontend only
cd frontend
docker build -t inventory-frontend .
docker run -p 3000:3000 inventory-frontend
```

## 🗄️ Database Setup

### Using Docker
Database akan otomatis disetup ketika menjalankan docker-compose.

### Manual Setup
```sql
-- Create database
CREATE DATABASE inventaris;

-- Create user (optional)
CREATE USER inventory_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE inventaris TO inventory_user;
```

### Run Migrations
```bash
cd backend
go run cmd/migrate/main.go
```

## 🌍 Environment Configurations

### Development Environment
- Debug mode enabled
- CORS allows localhost origins
- Database runs on Docker
- Hot reload for frontend
- Detailed logging

### Production Environment
- Release mode
- CORS restricted to production domains
- SSL enabled for database
- Optimized builds
- Error logging only

### Docker Environment
- All services containerized
- Internal networking
- Volume persistence
- Health checks enabled

## 📊 Monitoring & Logs

### Check Service Status
```bash
docker-compose ps
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Health Checks
```bash
# Backend health
curl http://localhost:8080/health

# Database health
docker-compose exec postgres pg_isready -U postgres
```

## 🔒 Security Considerations

### Production Checklist
- [ ] Change default JWT secret
- [ ] Use strong database passwords
- [ ] Enable SSL for database
- [ ] Configure proper CORS origins
- [ ] Set up HTTPS for frontend
- [ ] Enable security headers
- [ ] Configure firewall rules
- [ ] Set up SSL certificates

### Environment Security
- Never commit `.env` files to version control
- Use secrets management for production
- Rotate secrets regularly
- Monitor access logs
- Keep dependencies updated

## 🔧 Troubleshooting

### Common Issues

#### Database Connection Failed
```bash
# Check if database is running
docker-compose ps postgres

# Check database logs
docker-compose logs postgres

# Restart database
docker-compose restart postgres
```

#### Frontend Build Failed
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check environment variables
cat frontend/.env
```

#### Backend Compilation Error
```bash
# Clean module cache
go clean -modcache
go mod download

# Rebuild
go build ./cmd/main.go
```

### Performance Optimization

#### Database
- Configure proper indexes
- Set up connection pooling
- Monitor query performance
- Regular VACUUM operations

#### Backend
- Enable Gin release mode
- Configure proper timeouts
- Use caching where appropriate
- Monitor memory usage

#### Frontend
- Enable compression
- Optimize bundle size
- Use CDN for static assets
- Implement lazy loading

## 📞 Support

Untuk bantuan deployment atau konfigurasi:
1. Check dokumentasi API
2. Review application logs
3. Check environment variables
4. Verify network connectivity
5. Contact development team

## 📝 Notes

- Port defaults: Backend (8080), Frontend (3000), Database (5432)
- All timestamps use Asia/Jakarta timezone
- File uploads stored in `./uploads` directory
- Session tokens expire after 24 hours
