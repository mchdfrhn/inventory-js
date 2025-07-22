# 🔧 Environment Variables Guide

Panduan lengkap untuk konfigurasi environment variables pada aplikasi Inventory Management System.

## 📁 Backend Environment Variables

File: `backend/.env`

### 🔑 Environment & Server
```env
NODE_ENV=development        # development | production | test
PORT=8080                  # Port server backend (1000-65535)
HOST=localhost             # Host server (localhost | 0.0.0.0)
```

### 🗄️ Database Configuration

Aplikasi mendukung beberapa jenis database. Pilih salah satu sesuai kebutuhan:

#### 🐘 PostgreSQL (Recommended)
```env
DB_DIALECT=postgres        # Driver database
DB_HOST=localhost          # Host database
DB_PORT=5432              # Port PostgreSQL (default: 5432)
DB_USER=postgres          # Username PostgreSQL
DB_PASSWORD=yourpassword  # Password PostgreSQL
DB_NAME=inventaris        # Nama database
DB_SSL=false              # SSL connection (false/true)

# Connection URL (alternative)
DATABASE_URL=postgres://postgres:yourpassword@localhost:5432/inventaris
```

**Setup PostgreSQL:**
```bash
# Install PostgreSQL (Ubuntu/Debian)
sudo apt-get install postgresql postgresql-contrib

# Install PostgreSQL (macOS)
brew install postgresql

# Install PostgreSQL (Windows)
# Download dari: https://www.postgresql.org/download/windows/

# Create database
createdb inventaris
# atau
psql -U postgres -c "CREATE DATABASE inventaris;"
```

#### 🐬 MySQL/MariaDB
```env
DB_DIALECT=mysql           # Driver database  
DB_HOST=localhost          # Host database
DB_PORT=3306              # Port MySQL (default: 3306)
DB_USER=root              # Username MySQL
DB_PASSWORD=yourpassword  # Password MySQL
DB_NAME=inventaris        # Nama database
DB_SSL=false              # SSL connection
DB_CHARSET=utf8mb4        # Character set
DB_TIMEZONE=+07:00        # Timezone

# Connection URL (alternative)
DATABASE_URL=mysql://root:yourpassword@localhost:3306/inventaris
```

**Setup MySQL:**
```bash
# Install MySQL (Ubuntu/Debian)
sudo apt-get install mysql-server

# Install MySQL (macOS)
brew install mysql

# Install MariaDB (alternative)
sudo apt-get install mariadb-server

# Create database
mysql -u root -p -e "CREATE DATABASE inventaris;"
```

#### 🗃️ SQLite (Development/Testing)
```env
DB_DIALECT=sqlite          # Driver database
DB_STORAGE=./data/inventaris.sqlite  # Path file database

# Connection URL (alternative)
DATABASE_URL=sqlite:./data/inventaris.sqlite
```

**Setup SQLite:**
```bash
# Install SQLite (Ubuntu/Debian)
sudo apt-get install sqlite3

# Install SQLite (macOS)
brew install sqlite

# No need to create database, SQLite will create automatically
```

#### 🏢 Microsoft SQL Server
```env
DB_DIALECT=mssql           # Driver database
DB_HOST=localhost          # Host database
DB_PORT=1433              # Port SQL Server (default: 1433)
DB_USER=sa                # Username SQL Server
DB_PASSWORD=yourpassword  # Password SQL Server
DB_NAME=inventaris        # Nama database
DB_SSL=false              # SSL connection
DB_ENCRYPT=true           # Encryption setting
DB_TRUST_SERVER_CERTIFICATE=true  # Trust certificate

# Connection URL (alternative)
DATABASE_URL=mssql://sa:yourpassword@localhost:1433/inventaris
```

**Setup SQL Server:**
```bash
# Install SQL Server (Ubuntu)
# Follow: https://docs.microsoft.com/en-us/sql/linux/quickstart-install-connect-ubuntu

# Install SQL Server (Windows)
# Download dari: https://www.microsoft.com/en-us/sql-server/sql-server-downloads

# Create database
sqlcmd -S localhost -U sa -P yourpassword -Q "CREATE DATABASE inventaris;"
```

#### 🔄 Database Migration Support

| Database | Migration Support | Notes |
|----------|------------------|-------|
| PostgreSQL | ✅ Full | Recommended, semua fitur didukung |
| MySQL | ✅ Full | Didukung penuh, performance baik |
| SQLite | ⚠️ Limited | Baik untuk development, tidak untuk production |
| SQL Server | ✅ Full | Enterprise grade, performa tinggi |

### 🔐 JWT Configuration
```env
JWT_SECRET=your-secret    # Secret key JWT (WAJIB GANTI!)
JWT_EXPIRES_IN=24h        # Durasi token (1h, 24h, 7d)
```

### 📝 Logging
```env
LOG_LEVEL=info            # error | warn | info | debug
LOG_FILE=logs/app.log     # Path file log
```

### 🛡️ Security
```env
RATE_LIMIT_WINDOW_MS=900000  # Window rate limit (milidetik)
RATE_LIMIT_MAX=100           # Max request per window
CORS_ORIGIN=http://localhost:5173  # Frontend URL
```

### 📎 File Upload
```env
MAX_FILE_SIZE=5242880     # Max file size (bytes)
UPLOAD_PATH=uploads/      # Folder upload
```

## 🎨 Frontend Environment Variables

File: `frontend/.env`

### 🌐 API Configuration
```env
VITE_API_BASE_URL=http://localhost:8080  # Backend API URL
VITE_API_TIMEOUT=10000                   # Request timeout (ms)
```

### 📱 Application
```env
VITE_APP_NAME=STTPU Inventory System    # Nama aplikasi
VITE_APP_VERSION=1.0.0                  # Versi aplikasi
VITE_APP_ENV=development                 # Environment
```

### ⚡ Features
```env
VITE_ENABLE_ANALYTICS=false  # Google Analytics (true/false)
VITE_ENABLE_DEBUG=true       # Debug mode (true/false)
VITE_ENABLE_PWA=false        # Progressive Web App (true/false)
```

### 🎨 UI Configuration
```env
VITE_DEFAULT_THEME=light     # Theme (light | dark | auto)
VITE_ITEMS_PER_PAGE=10       # Items per page
VITE_MAX_FILE_SIZE=10485760  # Max upload size (bytes)
```

## 🔒 Security Best Practices

### Backend
1. **JWT_SECRET**: Gunakan string acak minimal 32 karakter
   ```bash
   # Generate dengan openssl
   openssl rand -base64 32
   ```

2. **DB_PASSWORD**: Gunakan password yang kuat
3. **CORS_ORIGIN**: Spesifik domain frontend untuk production
4. **NODE_ENV**: Set ke `production` untuk deployment

### Frontend
1. **VITE_API_BASE_URL**: Gunakan HTTPS untuk production
2. **VITE_ENABLE_DEBUG**: Set `false` untuk production

## 🚀 Environment Specific Configurations

### Development
```env
# Backend
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
LOG_LEVEL=debug

# Frontend
VITE_APP_ENV=development
VITE_ENABLE_DEBUG=true
```

### Production
```env
# Backend
NODE_ENV=production
CORS_ORIGIN=https://your-frontend-domain.com
LOG_LEVEL=error
JWT_SECRET=your-super-secure-random-string

# Frontend
VITE_APP_ENV=production
VITE_ENABLE_DEBUG=false
VITE_API_BASE_URL=https://your-backend-domain.com
```

## 📋 Quick Setup Checklist

### Backend Setup
- [ ] Copy `.env.example` to `.env`
- [ ] Update `DB_PASSWORD` dengan password PostgreSQL Anda
- [ ] Generate dan update `JWT_SECRET`
- [ ] Pastikan `PORT` tidak bentrok dengan aplikasi lain
- [ ] Update `CORS_ORIGIN` dengan URL frontend

### Frontend Setup
- [ ] Copy `.env.example` to `.env`
- [ ] Update `VITE_API_BASE_URL` dengan URL backend
- [ ] Sesuaikan `VITE_APP_NAME` jika diperlukan
- [ ] Set `VITE_ENABLE_DEBUG=false` untuk production

## 🆘 Troubleshooting

### Backend tidak bisa konek ke database
- Cek `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`
- Pastikan PostgreSQL berjalan
- Cek database `DB_NAME` sudah dibuat

### Frontend tidak bisa akses API
- Cek `VITE_API_BASE_URL` sesuai dengan backend
- Cek CORS di backend (`CORS_ORIGIN`)
- Pastikan backend berjalan di port yang benar

### JWT Token tidak valid
- Pastikan `JWT_SECRET` sama antara request
- Cek `JWT_EXPIRES_IN` format (1h, 24h, 7d)
