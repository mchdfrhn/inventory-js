# STTPU Inventory Management System

Sistem manajemen inventaris aset untuk STTPU (Sekolah Tinggi Teknologi Pembangunan Utama) yang dibangun dengan Node.js backend dan React frontend.

## 🏢 Tentang Sistem

**STTPU Inventory Management System** adalah aplikasi web untuk mengelola aset inventaris institusi pendidikan. Sistem ini menyediakan fitur lengkap untuk tracking, pencatatan, dan audit aset dengan interface yang user-friendly.

### 👨‍💻 Developer Information
- **Developer**: Mochammad Farhan Ali
- **Organization**: STTPU
- **Version**: v1.0.0
- **Year**: 2025

## ✨ Fitur Utama

### 📊 Manajemen Aset
- ✅ Pendaftaran aset dengan informasi lengkap
- ✅ Bulk asset management untuk efisiensi
- ✅ Tracking lokasi dan perpindahan aset
- ✅ Kalkulasi penyusutan otomatis
- ✅ Status monitoring (Baik, Tidak Memadai, Rusak)
- ✅ QR Code generation untuk aset

### 🏷️ Kategorisasi
- ✅ Manajemen kategori aset dengan kode unik
- ✅ Hierarki kategori yang fleksibel
- ✅ Import/export data kategori

### 📍 Manajemen Lokasi
- ✅ Struktur lokasi bertingkat (Gedung > Lantai > Ruangan)
- ✅ Pencarian lokasi yang cepat
- ✅ Mapping aset ke lokasi

### 📋 Audit & Tracking
- ✅ Comprehensive audit trail
- ✅ History perubahan lengkap
- ✅ Activity logging otomatis
- ✅ Report generation

### 📈 Pelaporan
- ✅ Dashboard analytics
- ✅ Asset value trends
- ✅ Depreciation reports
- ✅ Export to various formats

## 🛠️ Teknologi

### Backend
- **Language**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL 12+
- **ORM**: Sequelize
- **Architecture**: RESTful API

### Frontend
- **Framework**: React 19+
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Build Tool**: Vite
- **State Management**: Context API + React Query

### Infrastructure
- **Containerization**: Docker
- **Database**: PostgreSQL with optimized indexes
- **API**: RESTful API with comprehensive endpoints
- **Authentication**: JWT Token based

## 🚀 Quick Start

### Minimum Requirements
- Node.js 18+
- npm 8+
- PostgreSQL 12+

### Installation Steps

1. **Clone Repository**
   ```bash
   git clone <repository-url>
   cd inventory-js
   ```

2. **Setup Database**
   ```bash
   createdb inventaris
   ```

3. **Configure Backend**
   ```bash
   cd backend-nodejs
   cp .env.example .env
   # Edit .env dengan konfigurasi database Anda
   ```

4. **Install Dependencies & Start Backend**
   ```bash
   npm install
   npm run dev
   ```

5. **Start Frontend**
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

6. **Access Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8080
   - API Documentation: http://localhost:8080/api

## 📚 Dokumentasi

- [📋 Installation Guide](./INSTALLATION.md) - Panduan instalasi lengkap
- [🚀 Deployment Guide](./DEPLOYMENT.md) - Panduan deployment untuk berbagai environment

## 📋 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 12+
- npm 8+

### Installation
```bash
# 1. Clone repository
git clone <repository-url>
cd inventory-js

# 2. Setup backend
cd backend-nodejs
cp .env.example .env
npm install
docker-compose up -d postgres
npm run migrate

# 3. Setup frontend
cd ../frontend
cp .env.example .env
npm install

# 4. Run development
# Terminal 1: Backend
cd backend-nodejs && npm run dev

# Terminal 2: Frontend
cd frontend && npm run dev
```

### Automated Deployment
```bash
# Linux/Mac
./deploy.sh development

# Windows
deploy.bat development
```

### Access Application
- 🌐 Frontend: http://localhost:5173
- 🔌 Backend API: http://localhost:8080
- 📖 API Docs: http://localhost:8080/api

## 🏗️ Arsitektur Sistem

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database      │
│ (React + Vite)  │◄──►│ (Node.js/Express│◄──►│  (PostgreSQL)   │
│   Port: 5173    │    │   Port: 8080    │    │   Port: 5432    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Database Schema
- **asset_categories** - Kategori aset dengan kode unik
- **locations** - Lokasi fisik aset
- **assets** - Data utama aset dengan informasi lengkap
- **audit_logs** - Log aktivitas dan perubahan

## 🔌 API Endpoints

### Health & System
- `GET /health` - Status kesehatan sistem
- `GET /api` - Dokumentasi API

### Assets Management
- `POST /api/v1/assets` - Buat aset baru
- `GET /api/v1/assets` - Daftar semua aset
- `GET /api/v1/assets/:id` - Detail aset
- `PUT /api/v1/assets/:id` - Update aset
- `DELETE /api/v1/assets/:id` - Hapus aset
- `POST /api/v1/assets/bulk` - Buat aset bulk

### Categories Management
- `POST /api/v1/categories` - Buat kategori
- `GET /api/v1/categories` - Daftar kategori
- `PUT /api/v1/categories/:id` - Update kategori
- `DELETE /api/v1/categories/:id` - Hapus kategori

### Locations Management
- `POST /api/v1/locations` - Buat lokasi
- `GET /api/v1/locations` - Daftar lokasi
- `PUT /api/v1/locations/:id` - Update lokasi
- `DELETE /api/v1/locations/:id` - Hapus lokasi

### Audit Logs
- `GET /api/v1/audit-logs` - Daftar log audit
- `GET /api/v1/audit-logs/entity/:type/:id` - History entitas

## 🔧 Konfigurasi

### Backend Configuration (`backend-nodejs/.env`)
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
```

### Frontend Configuration (`frontend/.env`)
```env
VITE_API_BASE_URL=http://localhost:8080
```

## 🐳 Docker Support

### Backend + Database
```bash
cd backend-nodejs
docker-compose up -d
```

### Full Stack (Optional)
```bash
# Build and run all services
docker-compose -f docker-compose.full.yml up -d --build
```

## 🧪 Testing

### Backend Health Check
```bash
curl http://localhost:8080/health
```

### API Testing
```bash
# Get API documentation
curl http://localhost:8080/api

# List assets (empty initially)
curl http://localhost:8080/api/v1/assets
```

## 📊 Features Overview

### Asset Management
- Comprehensive asset information tracking
- Bulk asset creation and management
- Automatic depreciation calculation
- QR code generation for physical tracking
- Status monitoring and updates

### Location Tracking
- Hierarchical location structure
- Real-time asset location tracking
- Location-based reporting

### Audit Trail
- Complete change history
- User activity tracking
- Detailed audit reports

### Reporting & Analytics
- Asset value trends
- Depreciation reports
- Location-based analytics
- Export capabilities

## 🔒 Security Features

- Input validation and sanitization
- SQL injection prevention
- CORS configuration
- Audit logging for security monitoring
- Data integrity constraints

## 🚀 Performance Optimizations

- Database indexes for fast queries
- Connection pooling
- Efficient pagination
- Lazy loading for large datasets
- Caching strategies

## 📞 Support & Development

### Development Team
- **Lead Developer**: Mochammad Farhan Ali
- **Organization**: STTPU
- **Contact**: [Development Team Contact]

### Contributing
1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

### Issue Reporting
Please report issues through the repository issue tracker with:
- Detailed description
- Steps to reproduce
- Expected vs actual behavior
- System information

## 📄 License

Copyright (c) 2025 STTPU - Mochammad Farhan Ali

This project is developed specifically for STTPU (Sekolah Tinggi Teknologi Pembangunan Utama).

## 🙏 Acknowledgments

- STTPU for the opportunity to develop this system
- Open source community for the tools and libraries used
- All contributors and testers

---

**STTPU Inventory Management System v1.0.0**  
*Developed with ❤️ by Mochammad Farhan Ali for STTPU*
