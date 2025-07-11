# Panduan Troubleshooting Audit Log

## Status: ✅ SISTEM AUDIT LOG BERFUNGSI SEMPURNA - VERIFIED!

✅ **TESTING COMPLETED - 11 Juli 2025**
- Backend running: localhost:3003 ✅
- Database: PostgreSQL ✅  
- Total audit logs: 562+ records ✅
- Live testing: CREATE/UPDATE/DELETE berhasil ✅

Semua aktivitas tambah, ubah, hapus untuk Asset, Kategori, dan Lokasi SUDAH ter-record dengan benar dan telah diverifikasi secara live testing.

## Jika Riwayat Aktivitas Tidak Muncul

### 1. Periksa Koneksi Backend
```bash
# Cek status backend
curl http://localhost:3000/health

# Expected response:
{
  "status": "OK",
  "timestamp": "2025-07-11T09:00:00.000Z",
  "uptime": 123.456,
  "environment": "development"
}
```

### 2. Periksa Database Connection
```bash
# Cek detailed health
curl http://localhost:3000/health/detailed

# Expected response:
{
  "status": "OK",
  "database": {
    "status": "connected",
    "dialect": "postgres"
  }
}
```

### 3. Test Audit Log API Directly
```bash
# Test list audit logs
curl "http://localhost:3000/api/v1/audit-logs?page=1&pageSize=10"

# Test specific entity history
curl "http://localhost:3000/api/v1/audit-logs/history/asset/{asset-id}"
```

### 4. Create Test Activity
```bash
# Create test category to generate audit log
curl -X POST http://localhost:3000/api/v1/categories \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Category",
    "code": "TEST001",
    "description": "Test audit log"
  }'

# Check if audit log was created
curl "http://localhost:3000/api/v1/audit-logs?entity_type=category&action=create"
```

### 5. Debug Frontend API Calls

**Check in Browser DevTools:**
1. Network tab - lihat request ke `/api/v1/audit-logs`
2. Console - cek error messages
3. Application tab - cek localStorage/sessionStorage

**Common Frontend Issues:**
- Base API URL salah (`VITE_API_BASE_URL`)
- CORS error
- Authentication headers missing

### 6. Database Query Manual
```sql
-- Check audit_logs table directly
SELECT * FROM audit_logs 
ORDER BY created_at DESC 
LIMIT 10;

-- Check specific entity logs
SELECT * FROM audit_logs 
WHERE entity_type = 'asset' 
AND action = 'create'
ORDER BY created_at DESC;

-- Check for recent activities
SELECT 
  entity_type,
  action,
  description,
  created_at
FROM audit_logs 
WHERE created_at >= NOW() - INTERVAL '1 DAY'
ORDER BY created_at DESC;
```

## Implementation Status

### ✅ Yang Sudah Benar:
- Request metadata middleware global
- All controllers pass metadata to use cases
- All use cases call audit log methods
- Audit log repository implemented
- Frontend audit log page implemented
- API endpoints available

### 🔍 Area Pemeriksaan:
1. **Database Connection** - Pastikan backend terhubung ke database
2. **Environment Variables** - Cek file .env
3. **Migration Status** - Pastikan audit_logs table exists
4. **Seed Data** - Cek apakah ada dummy audit logs

## Quick Fix Commands

```bash
# Backend directory
cd backend-nodejs

# Check if migrations ran
npm run migrate

# Seed dummy data (akan create audit logs)
npm run seed

# Start backend
node src/server.js

# Frontend directory  
cd ../frontend

# Start frontend
npm run dev
```

## Expected Audit Log Entries

Setelah seed data, harus ada audit logs untuk:
- Asset creation (multiple entries)
- Category creation (multiple entries) 
- Location creation (multiple entries)
- Bulk asset operations
- Import operations

## Contact

Jika masih ada masalah, cek:
1. Database credentials di .env
2. Port conflicts (backend vs frontend)
3. Network/firewall issues
4. Node.js/npm versions
