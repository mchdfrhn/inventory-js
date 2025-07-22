# Installation Guide - STTPU Inventory Management System

## 🚀 Quick Installation

### 1. Prerequisites
- PostgreSQL 12+ 
- Node.js 18+
- npm 8+ atau yarn

### 2. Database Setup
```bash
# Create database
createdb inventaris

# Or using SQL:
psql -U postgres -c "CREATE DATABASE inventaris;"
```

### 3. Configure Database Connection
Edit `backend/.env`:
```env
# Server Configuration
PORT=8080
NODE_ENV=development
HOST=localhost

# Database Configuration
DB_DIALECT=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=123
DB_NAME=inventaris

# JWT Configuration
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=24h

# File Upload
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880
```

### 4. Install Dependencies & Start Backend
```bash
cd backend
npm install
npm run migrate
npm run dev
```

Backend akan otomatis menjalankan migrasi database dan membuat tabel yang diperlukan.

### 5. Run Frontend
```bash
cd frontend
npm install
npm run dev
```

## 📊 System Architecture

### Technology Stack:
- **Backend**: Node.js + Express.js
- **Database**: PostgreSQL dengan Sequelize ORM
- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: TailwindCSS

### Tables Created Automatically:
1. **asset_categories** - Categories with code and name
2. **locations** - Physical locations (Buildings, floors, rooms)
3. **assets** - Main asset table with complete information
4. **audit_logs** - Track all changes

### API Endpoints Available:

**Health & Info:**
- `GET /health` - Server health check
- `GET /api` - API documentation

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
- ✅ Automatic database migration with Sequelize
- ✅ PostgreSQL optimized with indexes
- ✅ Foreign key constraints
- ✅ Automatic timestamps
- ✅ Soft delete support
- ✅ Bulk asset management
- ✅ Complete audit trail
- ✅ CORS enabled for frontend integration
- ✅ File upload support
- ✅ CSV import/export functionality

## 🔧 Configuration Options

### Backend Configuration (`backend/.env`)
```env
# Server Configuration
PORT=8080
NODE_ENV=development
HOST=localhost

# Database Configuration  
DB_DIALECT=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=inventaris

# JWT Configuration
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=24h

# File Upload Configuration
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880
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
  "timestamp": "2025-07-16T...",
  "uptime": "...",
  "database": "connected",
  "version": "1.0.0"
}
```

### 2. Test API Documentation
```bash
curl http://localhost:8080/api
```

### 3. Test Frontend Access
Open browser: http://localhost:5173 (Vite dev server)

## 🔍 Troubleshooting

### Database Connection Issues
1. Pastikan PostgreSQL sedang berjalan
2. Periksa kredensial database di `.env`
3. Verifikasi database `inventaris` sudah dibuat
4. Periksa koneksi firewall/network

### Node.js Version Issues
Pastikan menggunakan Node.js versi 18 atau lebih tinggi:
```bash
node --version
npm --version
```

### Port Conflicts
- Backend default: 8080
- Frontend default: 5173 (Vite)
- Database default: 5432

Ubah port di file konfigurasi jika diperlukan.

### Migration Issues
Jika migrasi gagal, jalankan manual:
```bash
cd backend
npm run migrate
```

### Environment Variables
Pastikan file `.env` sudah dibuat dan dikonfigurasi dengan benar:
```bash
# Check backend env
cat backend/.env

# Check frontend env
cat frontend/.env
```

### Dependencies Issues
Jika ada masalah dengan dependencies:
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📝 Development Notes

### Project Structure
```
inventory-js/
├── backend/              # Node.js backend service
│   ├── src/             # Source code
│   │   ├── controllers/ # Route controllers
│   │   ├── models/      # Database models
│   │   ├── routes/      # API routes
│   │   ├── database/    # Database config & migrations
│   │   └── utils/       # Utilities
│   ├── tests/           # Test files
│   └── package.json     # Dependencies
├── frontend/            # React frontend
│   ├── src/            # Source code
│   │   ├── components/ # React components
│   │   ├── pages/      # Application pages
│   │   └── services/   # API services
│   └── package.json    # Dependencies
└── docs/               # Documentation
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
