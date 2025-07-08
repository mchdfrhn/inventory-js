# STTPU Inventory Management System - Backend API

Backend API untuk sistem manajemen inventaris STTPU yang dibangun dengan Node.js, Express, dan Sequelize.

## 🚀 Features

- **Clean Architecture**: Implementasi clean architecture dengan separation of concerns
- **Database Agnostic**: Support PostgreSQL, MySQL, dan SQLite
- **Audit Logging**: Comprehensive audit trail untuk semua operasi
- **Bulk Operations**: Support untuk operasi bulk asset
- **Import/Export**: Import dari CSV dan export ke CSV
- **Security**: Rate limiting, CORS, Helmet security headers
- **Validation**: Input validation dengan Joi
- **Docker Support**: Container-ready dengan Docker dan docker-compose
- **Logging**: Structured logging dengan Winston
- **Health Checks**: Health check endpoints untuk monitoring

## 📋 Prerequisites

- Node.js >= 18.0.0
- npm >= 8.0.0
- PostgreSQL >= 12 (atau MySQL/SQLite)
- Docker & Docker Compose (optional)

## 🛠 Installation

### Manual Installation

1. **Clone repository**
   ```bash
   git clone <repository-url>
   cd backend-nodejs
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment**
   ```bash
   cp .env.example .env
   # Edit .env file sesuai konfigurasi database Anda
   ```

4. **Setup database**
   ```bash
   # Jalankan migrasi
   npm run migrate
   
   # Insert data dummy (optional)
   npm run seed
   ```

5. **Start application**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

### Docker Installation

1. **Clone repository**
   ```bash
   git clone <repository-url>
   cd backend-nodejs
   ```

2. **Start dengan Docker Compose**
   ```bash
   docker-compose up -d
   ```

Server akan berjalan di http://localhost:8080

## 📁 Project Structure

```
src/
├── config/               # Konfigurasi aplikasi
├── controllers/          # HTTP request handlers
├── database/            # Database connection dan migrations
├── middlewares/         # Express middlewares
├── models/              # Database models (Sequelize)
├── repositories/        # Data access layer
├── routes/              # Route definitions
├── usecases/           # Business logic layer
├── utils/              # Utility functions
├── validations/        # Input validation schemas
└── server.js           # Application entry point
```

## 🔧 API Endpoints

### Health Check
- `GET /health` - Health check endpoint
- `GET /version` - Application version info

### Asset Management
- `GET /api/v1/assets` - List assets dengan filtering dan pagination
- `GET /api/v1/assets/:id` - Get asset by ID
- `POST /api/v1/assets` - Create new asset
- `PUT /api/v1/assets/:id` - Update asset
- `DELETE /api/v1/assets/:id` - Delete asset

### Bulk Asset Operations
- `POST /api/v1/assets/bulk` - Create bulk assets
- `GET /api/v1/assets/bulk/:bulk_id` - Get bulk assets
- `PUT /api/v1/assets/bulk/:bulk_id` - Update bulk assets
- `DELETE /api/v1/assets/bulk/:bulk_id` - Delete bulk assets
- `GET /api/v1/assets/with-bulk` - List assets with bulk view

### Import/Export
- `POST /api/v1/assets/import` - Import assets from CSV
- `GET /api/v1/assets/export` - Export assets to CSV

### Asset Categories
- `GET /api/v1/categories` - List categories
- `GET /api/v1/categories/:id` - Get category by ID
- `GET /api/v1/categories/code/:code` - Get category by code
- `POST /api/v1/categories` - Create category
- `PUT /api/v1/categories/:id` - Update category
- `DELETE /api/v1/categories/:id` - Delete category

### Locations
- `GET /api/v1/locations` - List locations dengan pagination
- `GET /api/v1/locations/:id` - Get location by ID
- `GET /api/v1/locations/code/:code` - Get location by code
- `GET /api/v1/locations/search` - Search locations
- `POST /api/v1/locations` - Create location
- `PUT /api/v1/locations/:id` - Update location
- `DELETE /api/v1/locations/:id` - Delete location

### Audit Logs
- `GET /api/v1/audit-logs` - List audit logs dengan filtering
- `GET /api/v1/audit-logs/history/:entityType/:entityId` - Get activity history
- `POST /api/v1/audit-logs/cleanup` - Cleanup old logs

## 🔍 Query Parameters

### Asset Filtering
```
GET /api/v1/assets?page=1&pageSize=10&search=laptop&category_id=uuid&status=baik
```

Available filters:
- `page` - Page number (default: 1)
- `pageSize` - Items per page (default: 10, max: 100)
- `search` - Search in nama, kode, spesifikasi
- `category_id` - Filter by category UUID
- `lokasi_id` - Filter by location ID
- `status` - Filter by status (baik, rusak, dalam_perbaikan, tidak_aktif)
- `from_date` - Filter by acquisition date from
- `to_date` - Filter by acquisition date to
- `min_price` - Minimum acquisition price
- `max_price` - Maximum acquisition price

## 📝 Request/Response Examples

### Create Asset
```bash
POST /api/v1/assets
Content-Type: application/json

{
  "kode": "LAPTOP001",
  "nama": "Laptop Dell Latitude",
  "spesifikasi": "Dell Latitude 5520, Intel i5, RAM 8GB",
  "quantity": 1,
  "satuan": "unit",
  "tanggal_perolehan": "2024-01-15",
  "harga_perolehan": 12000000,
  "umur_ekonomis_tahun": 4,
  "umur_ekonomis_bulan": 0,
  "category_id": "123e4567-e89b-12d3-a456-426614174000",
  "lokasi_id": 1,
  "status": "baik"
}
```

### Response Success
```json
{
  "success": true,
  "message": "Asset created successfully",
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174001",
    "kode": "LAPTOP001",
    "nama": "Laptop Dell Latitude",
    "category": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Elektronik",
      "code": "ELEKTRONIK"
    },
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

### Response Error
```json
{
  "success": false,
  "message": "Asset with code 'LAPTOP001' already exists"
}
```

## 🗃 Database Schema

### Assets Table
```sql
CREATE TABLE assets (
  id UUID PRIMARY KEY,
  kode VARCHAR(50) UNIQUE NOT NULL,
  nama VARCHAR(255) NOT NULL,
  spesifikasi TEXT,
  quantity INTEGER DEFAULT 1,
  satuan VARCHAR(50) NOT NULL,
  tanggal_perolehan DATE NOT NULL,
  harga_perolehan DECIMAL(15,2) NOT NULL,
  umur_ekonomis_tahun INTEGER DEFAULT 0,
  umur_ekonomis_bulan INTEGER DEFAULT 0,
  akumulasi_penyusutan DECIMAL(15,2) DEFAULT 0,
  nilai_sisa DECIMAL(15,2) DEFAULT 0,
  keterangan TEXT,
  lokasi VARCHAR(255),
  lokasi_id INTEGER REFERENCES locations(id),
  asal_pengadaan VARCHAR(255),
  category_id UUID REFERENCES asset_categories(id),
  status VARCHAR(20) DEFAULT 'baik',
  bulk_id UUID,
  bulk_sequence INTEGER DEFAULT 1,
  is_bulk_parent BOOLEAN DEFAULT false,
  bulk_total_count INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🔧 Environment Variables

```env
# Server
NODE_ENV=development
PORT=8080
HOST=localhost

# Database
DB_DRIVER=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=123
DB_NAME=inventaris

# Security
JWT_SECRET=your-secret-key
CORS_ORIGIN=*

# Logging
LOG_LEVEL=info
LOG_FILE=logs/app.log
```

## 🚦 Scripts

```bash
# Development
npm run dev          # Start with nodemon
npm run migrate      # Run database migrations
npm run seed         # Insert sample data

# Production
npm start            # Start production server

# Testing & Quality
npm test             # Run tests
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
```

## 🐳 Docker Commands

```bash
# Build dan start semua services
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop services
docker-compose down

# Rebuild
docker-compose up -d --build
```

## 📊 Monitoring

### Health Check
```bash
curl http://localhost:8080/health
```

Response:
```json
{
  "success": true,
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00Z",
  "service": "STTPU Inventory Management System",
  "version": "1.0.0",
  "uptime": 3600,
  "memory": {
    "rss": 52428800,
    "heapTotal": 29884416,
    "heapUsed": 18874352
  }
}
```

## 🔒 Security Features

- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS**: Configurable cross-origin resource sharing
- **Helmet**: Security headers untuk melindungi dari common attacks
- **Input Validation**: Comprehensive validation dengan Joi
- **SQL Injection Protection**: Sequelize ORM dengan parameterized queries

## 📈 Performance

- **Compression**: Gzip compression untuk responses
- **Database Indexing**: Optimized indexes untuk query performance
- **Connection Pooling**: Database connection pooling
- **Pagination**: Efficient pagination untuk large datasets

## 🔄 Migration dari Go Backend

Backend Node.js ini adalah rewrite lengkap dari backend Go yang ada dengan:

✅ **Feature Parity**: Semua fitur dari backend Go telah diimplementasi
✅ **API Compatibility**: Endpoint dan response format yang sama
✅ **Database Schema**: Schema database yang identik
✅ **Business Logic**: Logic bisnis yang sama untuk asset management
✅ **Audit Logging**: Comprehensive audit trail
✅ **Bulk Operations**: Support untuk bulk asset operations

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Developer

**Mochammad Farhan Ali**  
STTPU - Inventory Management System  
Version 1.0.0
