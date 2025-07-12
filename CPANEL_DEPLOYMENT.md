# 📡 Panduan Deploy STTPU Inventory di cPanel

Panduan lengkap untuk deploy aplikasi STTPU Inventory Management System di shared hosting cPanel.

## 📋 Prerequisites

### Minimum Requirements
- cPanel hosting dengan dukungan Node.js (minimal versi 18)
- MySQL/PostgreSQL database access
- File Manager atau FTP access
- Subdomain/domain yang sudah dikonfigurasi
- Minimal 1GB storage space

### Persiapan Sebelum Deploy
- Akses cPanel hosting
- Database credentials
- Domain/subdomain untuk aplikasi
- File source code yang sudah dicompile

## 🗄️ Setup Database di cPanel

### 1. Buat Database MySQL
1. Login ke cPanel
2. Pilih **MySQL Databases**
3. Buat database baru:
   ```
   Database Name: [username]_inventory
   ```
4. Buat user database:
   ```
   Username: [username]_invuser
   Password: [strong_password]
   ```
5. Assign user ke database dengan **ALL PRIVILEGES**

### 2. Import Database Schema
1. Buka **phpMyAdmin**
2. Pilih database yang baru dibuat
3. Import file SQL atau buat tabel manual:

```sql
-- Tabel asset_categories
CREATE TABLE asset_categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabel locations
CREATE TABLE locations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    parent_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES locations(id)
);

-- Tabel assets
CREATE TABLE assets (
    id INT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category_id INT,
    location_id INT,
    purchase_date DATE,
    purchase_price DECIMAL(15,2),
    current_value DECIMAL(15,2),
    condition_status ENUM('Baik', 'Tidak Memadai', 'Rusak') DEFAULT 'Baik',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES asset_categories(id),
    FOREIGN KEY (location_id) REFERENCES locations(id)
);

-- Tabel audit_logs
CREATE TABLE audit_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    entity_type VARCHAR(50) NOT NULL,
    entity_id INT NOT NULL,
    action VARCHAR(50) NOT NULL,
    old_values JSON,
    new_values JSON,
    user_info JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 📁 Persiapan File untuk Upload

### 1. Build Frontend
```bash
# Di komputer lokal
cd frontend
npm install
npm run build
```

Folder `dist` akan berisi file static yang perlu diupload.

### 2. Prepare Backend
```bash
# Di komputer lokal
cd backend-nodejs
npm install --production
```

### 3. Struktur File untuk Upload
```
public_html/
├── inventory/                 # Folder utama aplikasi
    ├── frontend/             # File static frontend
    │   ├── index.html
    │   ├── assets/
    │   └── [file hasil build]
    ├── backend/              # Backend Node.js
    │   ├── src/
    │   ├── package.json
    │   ├── node_modules/
    │   └── .env
    └── .htaccess            # Konfigurasi Apache
```

## 🚀 Langkah Deploy

### Step 1: Setup Node.js di cPanel

1. **Aktifkan Node.js**
   - Masuk ke cPanel → **Node.js**
   - Klik **Create Application**
   - Isi konfigurasi:
     ```
     Node.js Version: 18.x atau lebih tinggi
     Application Mode: Production
     Application Root: inventory/backend
     Application URL: yourdomain.com/inventory
     Application Startup File: src/server.js
     ```

2. **Set Environment Variables**
   ```
   NODE_ENV=production
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=[username]_invuser
   DB_PASSWORD=[your_password]
   DB_NAME=[username]_inventory
   PORT=3000
   JWT_SECRET=your_jwt_secret_key_here
   ```

### Step 2: Upload Files Backend

1. **Upload melalui File Manager**
   - Buka **File Manager** di cPanel
   - Navigate ke `public_html/inventory/backend/`
   - Upload semua file backend:
     ```
     - src/ (folder)
     - package.json
     - .env (dengan konfigurasi database)
     ```

2. **Install Dependencies**
   - Buka **Terminal** di cPanel
   - Navigate ke folder backend:
     ```bash
     cd public_html/inventory/backend
     npm install --production
     ```

### Step 3: Upload Frontend

1. **Upload File Build**
   - Upload semua file dari folder `dist` ke `public_html/inventory/frontend/`
   - Pastikan struktur seperti ini:
     ```
     public_html/inventory/frontend/
     ├── index.html
     ├── assets/
     │   ├── index-[hash].js
     │   ├── index-[hash].css
     │   └── [other assets]
     └── [other static files]
     ```

### Step 4: Konfigurasi .htaccess

1. **Buat file .htaccess di public_html/inventory/**
   ```apache
   # Redirect API calls to Node.js backend
   RewriteEngine On
   
   # API routes go to Node.js app
   RewriteRule ^api/(.*)$ http://localhost:3000/api/$1 [P,L]
   
   # Health and version endpoints
   RewriteRule ^health$ http://localhost:3000/health [P,L]
   RewriteRule ^version$ http://localhost:3000/version [P,L]
   
   # Static frontend files
   RewriteCond %{REQUEST_FILENAME} !-f
   RewriteCond %{REQUEST_FILENAME} !-d
   RewriteCond %{REQUEST_URI} !^/api/
   RewriteRule ^(.*)$ frontend/index.html [L]
   
   # Enable CORS
   Header add Access-Control-Allow-Origin "*"
   Header add Access-Control-Allow-Headers "origin, x-requested-with, content-type"
   Header add Access-Control-Allow-Methods "PUT, GET, POST, DELETE, OPTIONS"
   ```

2. **Buat .htaccess di public_html/inventory/frontend/**
   ```apache
   # Frontend routing untuk React Router
   Options -MultiViews
   RewriteEngine On
   RewriteCond %{REQUEST_FILENAME} !-f
   RewriteRule ^ index.html [QSA,L]
   
   # Caching untuk static assets
   <IfModule mod_expires.c>
       ExpiresActive on
       ExpiresByType text/css "access plus 1 year"
       ExpiresByType application/javascript "access plus 1 year"
       ExpiresByType image/png "access plus 1 year"
       ExpiresByType image/jpg "access plus 1 year"
       ExpiresByType image/jpeg "access plus 1 year"
   </IfModule>
   ```

### Step 5: Konfigurasi Environment Backend

Buat file `.env` di `public_html/inventory/backend/`:
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=[username]_invuser
DB_PASSWORD=[your_password]
DB_NAME=[username]_inventory

# Server Configuration
NODE_ENV=production
PORT=3000

# Security
JWT_SECRET=your_very_long_and_secure_jwt_secret_key_here_minimum_32_chars

# Application
API_BASE_URL=/inventory/api

# Upload Configuration
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760

# Logging
LOG_LEVEL=error
```

### Step 6: Update Frontend Configuration

Update file konfigurasi frontend untuk production:

1. **Update src/services/api.ts**
   ```typescript
   const API_BASE_URL = '/inventory/api/v1';
   
   // Ganti dari localhost ke path relatif
   export const api = axios.create({
     baseURL: API_BASE_URL,
     timeout: 10000,
   });
   ```

2. **Rebuild Frontend**
   ```bash
   # Di komputer lokal
   cd frontend
   npm run build
   ```

3. **Upload ulang file hasil build**

## 🔧 Start Aplikasi

### 1. Start Node.js Application
1. Buka **Node.js** di cPanel
2. Pilih aplikasi yang sudah dibuat
3. Klik **Start**
4. Pastikan status "Started"

### 2. Test Deployment
1. **Test Backend API**
   ```
   https://yourdomain.com/inventory/health
   https://yourdomain.com/inventory/version
   https://yourdomain.com/inventory/api/v1/assets
   ```

2. **Test Frontend**
   ```
   https://yourdomain.com/inventory/
   ```

## 🛠️ Troubleshooting

### Problem: Node.js App Tidak Start
**Solution:**
1. Check logs di cPanel Node.js section
2. Pastikan `src/server.js` ada dan benar
3. Verify environment variables
4. Check database connection

### Problem: Frontend Tidak Load
**Solution:**
1. Check .htaccess configuration
2. Verify file paths
3. Check browser console for errors
4. Ensure API calls use correct paths

### Problem: Database Connection Error
**Solution:**
1. Verify database credentials di .env
2. Check database user privileges
3. Test connection via phpMyAdmin
4. Ensure database exists

### Problem: 404 pada API Calls
**Solution:**
1. Check .htaccess rewrite rules
2. Verify Node.js app is running
3. Check API base URL configuration
4. Ensure mod_rewrite is enabled

### Problem: CORS Errors
**Solution:**
1. Add CORS headers to .htaccess
2. Update backend CORS configuration
3. Check if requests are going to correct URL

## 📊 Monitoring

### 1. Check Application Status
- cPanel → Node.js → View application status
- Check CPU and memory usage
- Monitor error logs

### 2. Database Monitoring
- phpMyAdmin → Status → Monitor
- Check connection count
- Monitor query performance

### 3. Log Files
```
public_html/inventory/backend/logs/
├── app.log       # Application logs
├── error.log     # Error logs
└── access.log    # Access logs
```

## 🔒 Security Considerations

### 1. File Permissions
```bash
# Set proper permissions
chmod 644 .env
chmod 644 .htaccess
chmod -R 755 src/
chmod -R 644 frontend/
```

### 2. Environment Security
- Jangan commit file .env
- Gunakan strong passwords
- Update dependencies regularly
- Monitor access logs

### 3. Database Security
- Gunakan user dengan minimal privileges
- Backup database secara regular
- Monitor suspicious queries

## 📋 Maintenance

### 1. Regular Tasks
- Monitor disk usage
- Check application logs
- Update dependencies
- Backup database
- Monitor performance

### 2. Updates
```bash
# Update backend dependencies
cd public_html/inventory/backend
npm update

# Restart Node.js app di cPanel
```

### 3. Backup Strategy
- Database: Export via phpMyAdmin
- Files: Download via File Manager
- Automate dengan cron jobs jika tersedia

## 📞 Support

### Development Information
- **System**: STTPU Inventory Management
- **Developer**: Mochammad Farhan Ali
- **Version**: v1.0.0
- **Technology**: Node.js + React

### Getting Help
1. Check application logs
2. Verify configuration files
3. Test database connection
4. Contact hosting support untuk server issues
5. Contact development team untuk application issues

## 📝 Production Checklist

- [ ] Database created and configured
- [ ] Node.js application configured in cPanel
- [ ] Backend files uploaded and dependencies installed
- [ ] Frontend built and uploaded
- [ ] .htaccess files configured
- [ ] Environment variables set
- [ ] Application started in cPanel
- [ ] Health check endpoints responding
- [ ] Frontend loading correctly
- [ ] API calls working
- [ ] Database operations functioning
- [ ] File uploads working (if applicable)
- [ ] Security configurations in place
- [ ] Backup strategy implemented

## 🎯 Next Steps

1. **Monitoring Setup**
   - Implement uptime monitoring
   - Set up error alerting
   - Monitor resource usage

2. **Performance Optimization**
   - Enable gzip compression
   - Optimize database queries
   - Implement caching strategy

3. **Security Enhancements**
   - SSL certificate installation
   - Regular security updates
   - Access logging analysis

---

**STTPU Inventory Management System**  
*cPanel Deployment Guide v1.0.0*  
*Developed by Mochammad Farhan Ali for STTPU*
