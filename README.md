# 📦 Inventory Management System

Sistem manajemen inventaris modern yang dibangun dengan Node.js (backend) dan React + TypeScript (frontend).

## 🏗️ Arsitektur

Aplikasi ini dirancang dengan arsitektur terpisah:
- **Backend**: REST API menggunakan Node.js + Express + PostgreSQL
- **Frontend**: Single Page Application menggunakan React + TypeScript + Vite

## 📁 Struktur Project

```
inventory-js/
├── backend/              # Node.js backend service
│   ├── src/             # Source code
│   ├── migrations/      # Database migrations
│   ├── tests/           # Unit & integration tests
│   ├── README.md        # Backend documentation
│   └── package.json     # Backend dependencies
├── frontend/            # React frontend application
│   ├── src/             # Source code
│   ├── public/          # Static assets
│   ├── README.md        # Frontend documentation
│   ├── DEPLOYMENT.md    # Frontend deployment guide
│   └── package.json     # Frontend dependencies
├── DATABASE_SETUP.md    # Database setup guide
├── ENV_GUIDE.md         # Environment variables guide
└── README.md           # Project documentation
```

## 🚀 Deployment Terpisah

### Backend Deployment

1. **Masuk ke folder backend**:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Setup environment**:
   ```bash
   cp .env.example .env
   # Edit .env dengan konfigurasi database Anda
   ```

4. **Setup database**:
   ```bash
   # Pastikan database sudah berjalan (PostgreSQL/MySQL/SQL Server)
   createdb inventaris  # untuk PostgreSQL
   npm run migrate
   ```

   > **Penting:** Setelah migrasi, Anda perlu membuat user baru untuk bisa login.
   > ```bash
   > curl -X POST http://localhost:8080/api/auth/register \
   >   -H "Content-Type: application/json" \
   >   -d '{"username": "admin", "password": "password", "fullName": "Admin User"}'
   > ```
   > **Catatan:** Di lingkungan pengembangan, database akan di-reset setiap kali server dimulai ulang. Anda perlu membuat ulang user setiap kali me-restart server.

   > 💡 **Database Support**: Aplikasi mendukung PostgreSQL, MySQL, SQLite, dan SQL Server. 
   > Lihat [DATABASE_SETUP.md](DATABASE_SETUP.md) untuk panduan setup database lain.

5. **Jalankan backend**:
   ```bash
   # Development
   npm run dev

   # Production
   npm start
   ```

   Backend akan berjalan di `http://localhost:8080`

### Frontend Deployment

1. **Masuk ke folder frontend**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Setup environment** (opsional):
   ```bash
   cp .env.example .env
   # Edit .env jika diperlukan
   ```

4. **Build dan jalankan**:
   ```bash
   # Development
   npm run dev

   # Build untuk production
   npm run build

   # Preview production build
   npm run preview
   ```

   Frontend akan berjalan di `http://localhost:5173` (dev) atau `http://localhost:4173` (preview)

## 🔧 Konfigurasi

### Backend Environment Variables
Lihat `backend/.env.example` untuk daftar lengkap variabel environment yang diperlukan.

### Frontend Environment Variables
Lihat `frontend/.env.example` untuk konfigurasi frontend (opsional).

### Panduan Lengkap
- **[ENV_GUIDE.md](ENV_GUIDE.md)** - Panduan lengkap environment variables
- **[DATABASE_SETUP.md](DATABASE_SETUP.md)** - Setup database (PostgreSQL, MySQL, SQLite, SQL Server)
- **[backend/README.md](backend/README.md)** - Dokumentasi backend API
- **[frontend/README.md](frontend/README.md)** - Dokumentasi frontend React
- **[frontend/DEPLOYMENT.md](frontend/DEPLOYMENT.md)** - Panduan deployment frontend

## 📚 Dokumentasi API

Dokumentasi API lengkap tersedia di `backend/API-DOCUMENTATION.md`

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 🛠️ Teknologi yang Digunakan

**Backend:**
- Node.js + Express.js
- PostgreSQL/MySQL/SQLite/SQL Server
- JWT Authentication
- File Upload (Multer)
- Jest (Testing)

**Frontend:**
- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Context API

## 📄 Lisensi

MIT License
