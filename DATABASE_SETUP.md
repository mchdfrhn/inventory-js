# 🗄️ Database Setup Guide

Panduan lengkap untuk setup berbagai jenis database pada Inventory Management System.

## 📋 Database yang Didukung

| Database | Status | Production Ready | Performance | Ease of Setup |
|----------|--------|------------------|-------------|---------------|
| PostgreSQL | ✅ Recommended | ✅ Yes | 🔥 Excellent | ⭐⭐⭐ |
| MySQL/MariaDB | ✅ Supported | ✅ Yes | 🔥 Excellent | ⭐⭐⭐⭐ |
| SQLite | ⚠️ Development Only | ❌ No | ⚡ Good | ⭐⭐⭐⭐⭐ |
| SQL Server | ✅ Supported | ✅ Yes | 🔥 Excellent | ⭐⭐ |

## 🐘 PostgreSQL Setup (Recommended)

### Installation

**Ubuntu/Debian:**
```bash
# Update package list
sudo apt update

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Start service
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**macOS:**
```bash
# Using Homebrew
brew install postgresql@15
brew services start postgresql@15

# Or using Postgres.app
# Download from: https://postgresapp.com/
```

**Windows:**
```bash
# Download installer from: https://www.postgresql.org/download/windows/
# Or using Chocolatey
choco install postgresql
```

### Configuration
```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE inventaris;
CREATE USER inventory_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE inventaris TO inventory_user;
\q
```

### Environment Variables
```env
DB_DIALECT=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USER=inventory_user
DB_PASSWORD=secure_password
DB_NAME=inventaris
DB_SSL=false

DATABASE_URL=postgres://inventory_user:secure_password@localhost:5432/inventaris
```

## 🐬 MySQL/MariaDB Setup

### Installation

**Ubuntu/Debian:**
```bash
# MySQL
sudo apt update
sudo apt install mysql-server

# MariaDB (alternative)
sudo apt install mariadb-server

# Secure installation
sudo mysql_secure_installation
```

**macOS:**
```bash
# MySQL
brew install mysql
brew services start mysql

# MariaDB
brew install mariadb
brew services start mariadb
```

**Windows:**
```bash
# Download MySQL installer from: https://dev.mysql.com/downloads/installer/
# Or using Chocolatey
choco install mysql
```

### Configuration
```bash
# Login to MySQL
mysql -u root -p

# Create database and user
CREATE DATABASE inventaris CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'inventory_user'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON inventaris.* TO 'inventory_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### Environment Variables
```env
DB_DIALECT=mysql
DB_HOST=localhost
DB_PORT=3306
DB_USER=inventory_user
DB_PASSWORD=secure_password
DB_NAME=inventaris
DB_SSL=false
DB_CHARSET=utf8mb4
DB_TIMEZONE=+07:00

DATABASE_URL=mysql://inventory_user:secure_password@localhost:3306/inventaris
```

## 🗃️ SQLite Setup (Development Only)

### Installation

**Ubuntu/Debian:**
```bash
sudo apt install sqlite3
```

**macOS:**
```bash
brew install sqlite
```

**Windows:**
```bash
# Download from: https://www.sqlite.org/download.html
# Or already included in Node.js
```

### Configuration
```bash
# No setup needed, database file will be created automatically
mkdir -p data
```

### Environment Variables
```env
DB_DIALECT=sqlite
DB_STORAGE=./data/inventaris.sqlite

DATABASE_URL=sqlite:./data/inventaris.sqlite
```

## 🏢 Microsoft SQL Server Setup

### Installation

**Ubuntu:**
```bash
# Add Microsoft repository
curl -fsSL https://packages.microsoft.com/keys/microsoft.asc | sudo gpg --dearmor -o /usr/share/keyrings/microsoft-prod.gpg
curl -fsSL https://packages.microsoft.com/config/ubuntu/20.04/mssql-server-2022.list | sudo tee /etc/apt/sources.list.d/mssql-server-2022.list

# Install SQL Server
sudo apt update
sudo apt install mssql-server

# Configure SQL Server
sudo /opt/mssql/bin/mssql-conf setup
```

**Windows:**
```bash
# Download from: https://www.microsoft.com/en-us/sql-server/sql-server-downloads
# Choose Express edition for free version
```

**Docker (All platforms):**
```bash
# Run SQL Server in Docker
docker run -e "ACCEPT_EULA=Y" -e "SA_PASSWORD=SecurePassword123!" \
   -p 1433:1433 --name sqlserver \
   -d mcr.microsoft.com/mssql/server:2022-latest
```

### Configuration
```bash
# Connect using sqlcmd
sqlcmd -S localhost -U sa -P 'SecurePassword123!'

# Create database and user
CREATE DATABASE inventaris;
GO
USE inventaris;
GO
CREATE LOGIN inventory_user WITH PASSWORD = 'secure_password';
GO
CREATE USER inventory_user FOR LOGIN inventory_user;
GO
ALTER ROLE db_owner ADD MEMBER inventory_user;
GO
EXIT
```

### Environment Variables
```env
DB_DIALECT=mssql
DB_HOST=localhost
DB_PORT=1433
DB_USER=inventory_user
DB_PASSWORD=secure_password
DB_NAME=inventaris
DB_SSL=false
DB_ENCRYPT=true
DB_TRUST_SERVER_CERTIFICATE=true

DATABASE_URL=mssql://inventory_user:secure_password@localhost:1433/inventaris
```

## 🔄 Database Migration

Setelah setup database, jalankan migration untuk membuat tabel:

```bash
cd backend

# Install dependencies (jika belum)
npm install

# Run migration
npm run migrate

# Check migration status
npm run migrate:status
```

## 🔍 Testing Database Connection

Buat script test untuk memverifikasi koneksi:

```javascript
// test-db-connection.js
const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: process.env.DB_DIALECT || 'postgres',
  logging: console.log
});

async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection successful!');
    
    // Test query
    const [results] = await sequelize.query('SELECT 1 as test');
    console.log('✅ Query test successful:', results);
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  } finally {
    await sequelize.close();
  }
}

testConnection();
```

Jalankan test:
```bash
node test-db-connection.js
```

## 🚨 Troubleshooting

### PostgreSQL Issues
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Check port
sudo netstat -plnt | grep 5432

# Reset password
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'newpassword';"
```

### MySQL Issues
```bash
# Check if MySQL is running
sudo systemctl status mysql

# Reset password
sudo mysql -e "ALTER USER 'root'@'localhost' IDENTIFIED BY 'newpassword';"
```

### SQLite Issues
```bash
# Check file permissions
ls -la data/inventaris.sqlite

# Create directory if not exists
mkdir -p data
```

### SQL Server Issues
```bash
# Check if service is running (Windows)
net start MSSQLSERVER

# Check Docker container
docker ps | grep sqlserver
docker logs sqlserver
```

## 📊 Performance Recommendations

### PostgreSQL
- Enable connection pooling
- Use appropriate indexes
- Configure `postgresql.conf` for your workload

### MySQL
- Use InnoDB storage engine
- Enable query cache
- Optimize `my.cnf` configuration

### SQLite
- Use WAL mode for better concurrency
- Keep database file on SSD
- Not recommended for production

### SQL Server
- Use appropriate recovery model
- Configure memory allocation
- Monitor index fragmentation

## 🔐 Security Best Practices

1. **Never use default passwords**
2. **Create dedicated database users**
3. **Use strong passwords (min 12 characters)**
4. **Enable SSL/TLS for production**
5. **Regularly backup databases**
6. **Monitor database access logs**
7. **Keep database software updated**
