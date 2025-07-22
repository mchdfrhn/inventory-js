# 🎨 STTPU Inventory - Frontend

Frontend aplikasi untuk sistem manajemen inventaris STTPU yang dibangun dengan React + TypeScript + Vite.

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.0.0
- npm atau yarn

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Setup environment** (optional):
   ```bash
   cp .env.example .env
   # Edit .env jika perlu menyesuaikan API URL
   ```

3. **Run application**:
   ```bash
   # Development server
   npm run dev
   
   # Build for production
   npm run build
   
   # Preview production build
   npm run preview
   
   # Run tests
   npm test
   
   # Lint code
   npm run lint
   ```

4. **Access application**:
   - Development: `http://localhost:5173`
   - Preview: `http://localhost:4173`

## 🔧 Configuration

### Environment Variables

Konfigurasi dilakukan melalui file `.env`:

```env
# API Backend URL
VITE_API_BASE_URL=http://localhost:8080

# Application settings
VITE_APP_NAME=STTPU Inventory System
VITE_APP_VERSION=1.0.0
```

Lihat `.env.example` untuk daftar lengkap konfigurasi.

### Backend Connection

Pastikan backend API berjalan di URL yang sesuai dengan `VITE_API_BASE_URL`.

## 🛠️ Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool & dev server
- **Tailwind CSS** - Styling framework
- **React Router** - Client-side routing
- **Context API** - State management

## 📁 Project Structure

```
src/
├── components/         # Reusable UI components
├── pages/             # Page components
├── context/           # React Context providers
├── hooks/             # Custom React hooks
├── services/          # API service functions
├── utils/             # Utility functions
├── assets/            # Static assets
├── App.tsx            # Main App component
└── main.tsx           # Entry point
```

## 📝 Available Scripts

```bash
npm run dev            # Start development server
npm run build          # Build for production
npm run preview        # Preview production build
npm run lint           # Lint code with ESLint
npm run lint:fix       # Fix linting issues
npm test               # Run tests
```

## 🏗️ Build & Deployment

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
```

Build output akan tersedia di folder `dist/`.

### Static File Server
Untuk serving file static, Anda bisa menggunakan:
- Nginx
- Apache
- Node.js static server
- CDN

### Environment Specific Builds
```bash
# Development build
npm run build

# Production build (dengan optimizations)
NODE_ENV=production npm run build
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 🔗 API Integration

Frontend berkomunikasi dengan backend melalui REST API:
- Base URL: `VITE_API_BASE_URL`
- Format: JSON
- Authentication: JWT (jika diperlukan)

## 📱 Features

- ✅ Responsive design
- ✅ Real-time data updates
- ✅ Form validation
- ✅ File upload
- ✅ Search & filtering
- ✅ Pagination
- ✅ Dark/light theme support
- ✅ TypeScript type safety

## 🎨 Styling

Menggunakan Tailwind CSS untuk styling. Konfigurasi ada di `tailwind.config.js`.

## 📄 License

MIT License
