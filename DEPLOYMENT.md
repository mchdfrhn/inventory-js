# STTPU Inventory Management System - Deployment Guide

Panduan deployment untuk STTPU Inventory Management System dengan PostgreSQL.

## 📋 Prerequisites

- Docker & Docker Compose
- Node.js 18+ (untuk development)
- Go 1.21+ (untuk development)
- PostgreSQL 12+ (jika tidak menggunakan Docker)

## 🚀 Quick Start

### 1. Clone Repository
```bash
git clone <repository-url>
cd inventory
```

### 2. Setup Environment
```bash
# Backend configuration already set in config.yaml
# Frontend environment (optional)
cd frontend
cp .env.example .env
```

### 3. Deploy

#### For Development (Recommended)
```bash
# Start backend
cd backend
go run cmd/main.go

# Start frontend (in new terminal)
cd frontend
npm install
npm run dev
```

#### For Docker
```bash
cd backend
docker-compose up -d
```

## 📁 Configuration Files

### Backend Configuration (`backend/config.yaml`)
```yaml
server:
  port: "8080"
  mode: "debug"

database:
  driver: "postgres"  # Only PostgreSQL supported
  host: "localhost"
  port: "5432"
  user: "postgres"
  password: "123"     # Change for production
  dbname: "inventaris"
  sslmode: "disable"
```

### Frontend Environment Variables (`frontend/.env`)

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `VITE_API_BASE_URL` | Backend API URL | http://localhost:8080 | Yes |

## 🔧 Manual Deployment

### Backend Only
```bash
cd backend

# Ensure PostgreSQL is running and database exists
createdb inventaris

# Start backend (auto-migration enabled)
go run cmd/main.go
```

### Frontend Only
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Or build for production
npm run build
npm run preview
```

## 🐳 Docker Deployment

### Backend with PostgreSQL
```bash
cd backend
docker-compose up -d
```

This will start:
- PostgreSQL database
- Backend API server
- Automatic database migration

### Frontend Docker Build
```bash
cd frontend
docker build -t inventory-frontend .
docker run -p 3000:3000 inventory-frontend
```

## 🗄️ Database Setup

### Automatic Setup (Recommended)
The backend automatically handles database migration when started. No manual migration needed.

### Manual Database Creation
```sql
-- Create database
CREATE DATABASE inventaris;

-- Create user (optional)
CREATE USER inventory_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE inventaris TO inventory_user;
```

### Schema Information
The system automatically creates:
- `asset_categories` - Asset categories with code and name
- `locations` - Physical locations
- `assets` - Main asset table with complete information
- `audit_logs` - Activity tracking

## 🌍 Environment Configurations

### Development Environment
- Debug mode enabled
- CORS allows all origins
- Database on localhost
- Hot reload for frontend
- Detailed logging
- Auto-migration enabled

### Production Environment
- Release mode recommended
- Restricted CORS origins
- SSL enabled for database
- Optimized builds
- Error logging only
- Manual migration verification

## 📊 Monitoring & Health Checks

### Backend Health Check
```bash
curl http://localhost:8080/health
```

Expected response:
```json
{
  "status": "ok",
  "time": "2025-07-08T...",
  "service": "STTPU Inventory Management System",
  "version": "v1.0.0",
  "developer": "Mochammad Farhan Ali"
}
```

### Version Information
```bash
curl http://localhost:8080/version
```

### Database Health
```bash
# If using Docker
docker-compose exec postgres pg_isready -U postgres

# Manual check
psql -U postgres -d inventaris -c "SELECT version();"
```

## 🔒 Security Considerations

### Production Checklist
- [ ] Change default database password
- [ ] Enable SSL for database connection
- [ ] Configure proper CORS origins
- [ ] Set up HTTPS for frontend
- [ ] Use environment variables for secrets
- [ ] Configure firewall rules
- [ ] Set up SSL certificates
- [ ] Regular security updates

### Database Security
```yaml
# Production database config
database:
  driver: "postgres"
  host: "your-db-host"
  port: "5432"
  user: "inventory_user"
  password: "${DB_PASSWORD}"  # From environment
  dbname: "inventaris"
  sslmode: "require"
```

## 🔧 Troubleshooting

### Common Issues

#### Database Connection Failed
```bash
# Check if PostgreSQL is running
systemctl status postgresql  # Linux
brew services list | grep postgres  # macOS

# Check database exists
psql -U postgres -l | grep inventaris

# Test connection
psql -U postgres -d inventaris -c "SELECT 1;"
```

#### Backend Migration Warnings
The backend may show warnings about existing tables or indexes. This is normal and doesn't affect functionality.

#### Frontend Build Failed
```bash
# Clear cache and reinstall
cd frontend
rm -rf node_modules package-lock.json
npm install

# Check environment variables
cat .env
```

#### Port Conflicts
Default ports:
- Backend: 8080
- Frontend: 3000 (dev), 4173 (preview)
- Database: 5432

Change in configuration files if needed.

### Performance Optimization

#### Database
- Indexes are automatically created
- Use connection pooling in production
- Monitor query performance
- Regular VACUUM operations

#### Backend
- Set `mode: "release"` for production
- Configure proper timeouts
- Monitor memory usage
- Use reverse proxy (nginx)

#### Frontend
- Use `npm run build` for production
- Enable gzip compression
- Use CDN for static assets
- Implement caching strategy

## 🚀 API Endpoints

### Health & System
- `GET /health` - Health check
- `GET /version` - Version info

### Assets Management
- `POST /api/v1/assets` - Create asset
- `GET /api/v1/assets` - List assets
- `GET /api/v1/assets/:id` - Get asset
- `PUT /api/v1/assets/:id` - Update asset
- `DELETE /api/v1/assets/:id` - Delete asset
- `POST /api/v1/assets/bulk` - Bulk create

### Categories Management
- `POST /api/v1/categories` - Create category
- `GET /api/v1/categories` - List categories
- `PUT /api/v1/categories/:id` - Update category
- `DELETE /api/v1/categories/:id` - Delete category

### Locations Management
- `POST /api/v1/locations` - Create location
- `GET /api/v1/locations` - List locations
- `PUT /api/v1/locations/:id` - Update location
- `DELETE /api/v1/locations/:id` - Delete location

### Audit Logs
- `GET /api/v1/audit-logs` - List audit logs
- `GET /api/v1/audit-logs/entity/:type/:id` - Entity history

## 📞 Support

### System Information
- **Developer**: Mochammad Farhan Ali
- **Organization**: STTPU
- **Version**: v1.0.0
- **Database**: PostgreSQL only
- **Architecture**: Go backend + React frontend

### Getting Help
1. Check logs: Backend console output
2. Verify database connection
3. Check API endpoints with curl
4. Review configuration files
5. Contact development team

## 📝 Notes

- Only PostgreSQL is supported for database
- Auto-migration handles database setup
- All timestamps use system timezone
- CORS is enabled for development
- Session management built-in
- File uploads supported

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
