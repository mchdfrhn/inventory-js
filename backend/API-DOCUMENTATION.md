# STTPU Inventory Management System - Backend API

Backend API untuk sistem manajemen inventaris STTPU yang dibangun dengan Node.js, Express, dan Sequelize.

## 🚀 Features

- **RESTful API** dengan endpoint lengkap untuk manajemen inventaris
- **Database ORM** menggunakan Sequelize dengan support PostgreSQL
- **Validation** komprehensif untuk semua input data
- **Audit Logging** untuk tracking semua perubahan data
- **Bulk Operations** untuk operasi data dalam jumlah besar
- **Search & Filtering** dengan pagination
- **Error Handling** yang konsisten
- **Health Checks** untuk monitoring sistem
- **API Documentation** terintegrasi

## 📋 Prerequisites

- Node.js 18.x atau lebih tinggi
- PostgreSQL 12.x atau lebih tinggi
- npm atau yarn

## 🛠 Installation

### Quick Start

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
   # Buat database
   createdb inventaris
   
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

Server akan berjalan di http://localhost:8080

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
- `GET /health/detailed` - Detailed health check dengan info database

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

### Pagination
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)

### Searching
- `search` - Search term untuk nama, deskripsi, atau nomor aset
- `category_id` - Filter by category ID
- `location_id` - Filter by location ID
- `status` - Filter by status (aktif, tidak_aktif, rusak, hilang)
- `condition` - Filter by condition (baik, rusak, perlu_perbaikan)

### Sorting
- `sort_by` - Field untuk sorting (default: created_at)
- `sort_order` - Order direction (asc, desc) (default: desc)

## 📝 Request/Response Examples

### Create Asset
```bash
curl -X POST http://localhost:8080/api/v1/assets \
  -H "Content-Type: application/json" \
  -d '{
    "asset_number": "IT001",
    "name": "Laptop Dell",
    "description": "Laptop untuk development",
    "category_id": 1,
    "location_id": 1,
    "purchase_date": "2024-01-01",
    "purchase_price": 15000000,
    "condition": "baik",
    "status": "aktif"
  }'
```

### Response Success (201)
```json
{
  "success": true,
  "message": "Asset created successfully",
  "data": {
    "id": 1,
    "asset_number": "IT001",
    "name": "Laptop Dell",
    "description": "Laptop untuk development",
    "category_id": 1,
    "location_id": 1,
    "purchase_date": "2024-01-01",
    "purchase_price": 15000000,
    "condition": "baik",
    "status": "aktif",
    "created_at": "2024-07-22T10:00:00.000Z",
    "updated_at": "2024-07-22T10:00:00.000Z"
  }
}
```

### Error Response (400)
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "asset_number",
      "message": "Asset number is required"
    }
  ]
}
```

## 🗃 Database Schema

### Assets Table
- `id` - Primary key (AUTO_INCREMENT)
- `asset_number` - Unique asset number
- `name` - Asset name
- `description` - Asset description
- `category_id` - Foreign key to categories
- `location_id` - Foreign key to locations
- `purchase_date` - Purchase date
- `purchase_price` - Purchase price
- `condition` - Asset condition (baik, rusak, perlu_perbaikan)
- `status` - Asset status (aktif, tidak_aktif, rusak, hilang)
- `bulk_id` - Bulk operation ID (optional)

### Categories Table
- `id` - Primary key (AUTO_INCREMENT)
- `code` - Unique category code
- `name` - Category name
- `description` - Category description

### Locations Table
- `id` - Primary key (AUTO_INCREMENT)
- `code` - Unique location code
- `name` - Location name
- `building` - Building name
- `floor` - Floor number
- `room` - Room number
- `description` - Location description

### Audit Logs Table
- `id` - Primary key (AUTO_INCREMENT)
- `entity_type` - Type of entity (asset, category, location)
- `entity_id` - ID of the entity
- `action` - Action performed (create, update, delete)
- `old_values` - Previous values (JSON)
- `new_values` - New values (JSON)
- `user_id` - User who performed the action
- `timestamp` - When the action occurred

## 🔧 Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NODE_ENV` | Environment mode | development | No |
| `PORT` | Server port | 8080 | No |
| `HOST` | Server host | localhost | No |
| `DB_DIALECT` | Database dialect | postgres | Yes |
| `DB_HOST` | Database host | localhost | Yes |
| `DB_PORT` | Database port | 5432 | Yes |
| `DB_USER` | Database username | postgres | Yes |
| `DB_PASSWORD` | Database password | | Yes |
| `DB_NAME` | Database name | inventaris | Yes |
| `DB_SSL` | Enable SSL for database | false | No |
| `JWT_SECRET` | JWT secret key | | Yes |
| `JWT_EXPIRES_IN` | JWT expiration time | 24h | No |
| `LOG_LEVEL` | Logging level | info | No |
| `LOG_FILE` | Log file path | logs/app.log | No |
| `CORS_ORIGIN` | CORS allowed origins | * | No |
| `MAX_FILE_SIZE` | Max upload file size | 5242880 | No |
| `UPLOAD_PATH` | Upload directory | uploads/ | No |

## 🚦 Scripts

```bash
# Start application
npm start                 # Production mode
npm run dev              # Development mode with nodemon

# Database operations
npm run migrate          # Run database migrations
npm run migrate:status   # Check migration status
npm run seed             # Insert sample data

# Testing
npm test                 # Run all tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run tests with coverage report

# API Testing
npm run test:api         # Run API endpoint tests
./test-api-comprehensive.sh  # Run bash script API tests

# Linting and formatting
npm run lint             # Check code style
npm run lint:fix         # Fix code style issues
```

## 🧪 Testing

### Unit Tests
```bash
npm test
```

### API Tests
```bash
# Using Jest
npm run test:api

# Using bash script
./test-api-comprehensive.sh
```

### Manual API Testing
```bash
# Health check
curl http://localhost:8080/health

# List assets
curl http://localhost:8080/api/v1/assets

# Create asset
curl -X POST http://localhost:8080/api/v1/assets \
  -H "Content-Type: application/json" \
  -d '{"asset_number":"TEST001","name":"Test Asset","category_id":1,"location_id":1}'
```

## 🐳 Docker Commands

```bash
# Build and run
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop services
docker-compose down

# Rebuild
docker-compose up -d --build
```

## 📊 Monitoring

### Health Checks
- Basic health: `GET /health`
- Detailed health: `GET /health/detailed`

### Logs
- Application logs: `logs/app.log`
- Error logs: `logs/error.log`
- Access logs: `logs/access.log`
- Audit logs: `logs/audit.log`
- Docker logs: `docker-compose logs backend`

### Metrics
- Request count dan response time
- Database connection status
- Memory usage
- Error rates

## 🔒 Security Features

- **Input Validation** menggunakan Joi schemas
- **SQL Injection Protection** melalui Sequelize ORM
- **CORS Protection** dengan konfigurasi yang tepat
- **Rate Limiting** untuk mencegah abuse
- **Helmet.js** untuk security headers
- **Environment Variables** untuk sensitive data

## 📈 Performance

- **Database Connection Pooling**
- **Request Compression** dengan gzip
- **Caching** headers untuk static resources
- **Pagination** untuk large datasets
- **Database Indexes** pada foreign keys
- **Query Optimization** dengan Sequelize

## 🔄 Migration dari Go Backend

Sistem ini menggantikan backend Go dengan fitur yang sama:

### Perbedaan Utama
- **Runtime**: Node.js vs Go
- **ORM**: Sequelize vs GORM
- **Database**: PostgreSQL (sama)
- **API Structure**: Sama dengan endpoint yang compatible

### Migration Steps
1. Export data dari Go backend
2. Run migration scripts
3. Import data ke Node.js backend
4. Update frontend API calls (minimal changes needed)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Developer

**Mochammad Farhan Ali**
- Organization: STTPU
- Email: [your-email@example.com]
- GitHub: [your-github-username]

## 📞 Support

Untuk bantuan dan pertanyaan:

1. **Documentation**: Baca dokumentasi lengkap di file ini
2. **Issues**: Buat issue di GitHub repository
3. **Health Check**: Cek status aplikasi di `/health/detailed`
4. **Logs**: Periksa log aplikasi untuk debugging
5. **Contact**: Hubungi developer untuk support

---

## 🔄 Version History

### v1.0.0 (Current)
- ✅ Complete REST API implementation
- ✅ PostgreSQL database integration
- ✅ Comprehensive validation
- ✅ Audit logging system
- ✅ Bulk operations
- ✅ Import/Export functionality
- ✅ Health monitoring
- ✅ Docker support
- ✅ Comprehensive testing

---

*Last Updated: July 22, 2025*  
*Version: 1.0.0*  
*Developer: Mochammad Farhan Ali - STTPU*
