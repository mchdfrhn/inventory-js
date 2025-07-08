# Installation Guide - STTPU Inventory Management System

## 🚀 Quick Installation

### 1. Prerequisites
- PostgreSQL 12+ 
- Go 1.21+
- Node.js 18+

### 2. Database Setup
```bash
# Create database
createdb inventaris

# Or using SQL:
psql -U postgres -c "CREATE DATABASE inventaris;"
```

### 3. Configure Database Connection
Edit `backend/config.yaml`:
```yaml
server:
  port: "8080"
  mode: "debug"

database:
  driver: "postgres"
  host: "localhost"
  port: "5432"
  user: "postgres"
  password: "123"  # Change this to your password
  dbname: "inventaris"
  sslmode: "disable"
```

### 4. Run Backend
```bash
cd backend
go mod tidy
go run cmd/main.go
```

The backend will automatically handle database migrations and create all necessary tables.

### 5. Run Frontend
```bash
cd frontend
npm install
npm run dev
```

## 📊 System Architecture

### Tables Created Automatically:
1. **asset_categories** - Categories with code and name
2. **locations** - Physical locations (Buildings, floors, rooms)
3. **assets** - Main asset table with complete information
4. **audit_logs** - Track all changes

### API Endpoints Available:

**Health & Info:**
- `GET /health` - Server health check
- `GET /version` - Server version info

**Assets API:**
- `POST /api/v1/assets` - Create asset
- `POST /api/v1/assets/bulk` - Create bulk assets
- `GET /api/v1/assets` - List assets
- `GET /api/v1/assets/:id` - Get asset by ID
- `PUT /api/v1/assets/:id` - Update asset
- `DELETE /api/v1/assets/:id` - Delete asset

**Categories API:**
- `POST /api/v1/categories` - Create category
- `GET /api/v1/categories` - List categories
- `PUT /api/v1/categories/:id` - Update category
- `DELETE /api/v1/categories/:id` - Delete category

**Locations API:**
- `POST /api/v1/locations` - Create location
- `GET /api/v1/locations` - List locations
- `PUT /api/v1/locations/:id` - Update location
- `DELETE /api/v1/locations/:id` - Delete location

**Audit Logs API:**
- `GET /api/v1/audit-logs` - List audit logs
- `GET /api/v1/audit-logs/entity/:entity_type/:entity_id` - Get entity history

### Key Features:
- ✅ Automatic database migration
- ✅ PostgreSQL optimized indexes
- ✅ Foreign key constraints
- ✅ Automatic timestamps
- ✅ Soft delete support
- ✅ Bulk asset management
- ✅ Complete audit trail
- ✅ CORS enabled for frontend integration

## 🔧 Configuration Options

### Backend Configuration (`backend/config.yaml`)
```yaml
server:
  port: "8080"        # Server port
  mode: "debug"       # debug or release

database:
  driver: "postgres"  # Only PostgreSQL supported
  host: "localhost"   # Database host
  port: "5432"       # Database port
  user: "postgres"   # Database user
  password: "123"    # Database password
  dbname: "inventaris" # Database name
  sslmode: "disable" # SSL mode
```

### Frontend Configuration (`frontend/.env`)
```env
VITE_API_BASE_URL=http://localhost:8080
```

## 🧪 Testing Installation

### 1. Test Backend Health
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

### 2. Test API Version
```bash
curl http://localhost:8080/version
```

### 3. Test Frontend Access
Open browser: http://localhost:3000

## 🐳 Docker Alternative

If you prefer using Docker:

```bash
cd backend
docker-compose up -d
```

This will start PostgreSQL and the backend service.

## 🔍 Troubleshooting

### Database Connection Issues
1. Ensure PostgreSQL is running
2. Check database credentials in `config.yaml`
3. Verify database `inventaris` exists
4. Check firewall/network connectivity

### Migration Warnings
The system may show warnings about existing indexes or columns. This is normal and doesn't affect functionality.

### Port Conflicts
- Backend default: 8080
- Frontend default: 3000
- Database default: 5432

Change ports in configuration files if needed.

## 📝 Development Notes

### Project Structure
```
inventory/
├── backend/           # Go backend service
│   ├── cmd/          # Main application
│   ├── internal/     # Business logic
│   ├── migrations/   # Database migrations
│   └── config.yaml   # Configuration
├── frontend/         # React frontend
│   ├── src/         # Source code
│   └── public/      # Static assets
└── docs/            # Documentation
```

### Developer Credits
- **Developer**: Mochammad Farhan Ali
- **Organization**: STTPU
- **Version**: v1.0.0
- **System**: Inventory Management System

## 🚀 Production Deployment

For production deployment, see `DEPLOYMENT.md` for detailed instructions including:
- Docker deployment
- Environment configuration
- Security considerations
- Performance optimization
