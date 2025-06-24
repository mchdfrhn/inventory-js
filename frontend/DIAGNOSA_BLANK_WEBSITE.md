# 🚨 DIAGNOSA WEBSITE BLANK - SOLUSI

## 🔍 Masalah Teridentifikasi

Website blank karena **DashboardPage component** mengalami error saat rendering. Kemungkinan penyebab:

### 1. **API Call Error**
DashboardPage melakukan multiple API calls yang mungkin stuck atau error:
- `assetApi` untuk data asset
- `categoryApi` untuk data kategori  
- `locationApi` untuk data lokasi

### 2. **Backend Not Running**
API endpoints tidak tersedia karena backend Go server tidak berjalan.

### 3. **Query Infinite Loop**
React Query hooks di DashboardPage mungkin masuk infinite loading.

## ✅ SOLUSI LANGKAH DEMI LANGKAH

### **Step 1: Cek Backend Server**
```bash
cd d:\Project\STTPU\v1\inventory\backend
go run cmd/main.go
```

**Expected output:**
```
Server starting on :8080
Database connected successfully
```

### **Step 2: Test API Manual**
```bash
curl http://localhost:8080/api/assets
curl http://localhost:8080/api/categories  
curl http://localhost:8080/api/locations
```

### **Step 3: Fix Frontend Routes (Temporary)**
Ganti homepage dengan TestPage sampai backend siap:

```tsx
// di App.tsx
<Route index element={<TestPage />} />
// bukan: <Route index element={<DashboardPage />} />
```

### **Step 4: Check Browser Console**
Buka F12 → Console untuk melihat error JavaScript atau network errors.

### **Step 5: Alternative Quick Fix**
Jika backend belum siap, gunakan mock data di DashboardPage:

```tsx
// Di DashboardPage.tsx
const mockAssets = [
  { id: 1, name: "Test Asset", category: "Test" }
];

// Replace useQuery with:
const { data: assets = mockAssets, isLoading: assetsLoading } = { 
  data: mockAssets, 
  isLoading: false 
};
```

## 🎯 RECOMMENDED ACTION

**Immediate Fix:**
1. Start backend server
2. If backend not ready, use TestPage as homepage temporarily
3. Check network tab in browser for failed API calls

**Current Working Routes:**
- ✅ `/test` - Working (TestPage)
- ❌ `/` - Blank (DashboardPage error)
- ❓ `/reports` - Need to test after backend ready

## 🔧 Quick Fix Applied

Mengubah homepage ke TestPage sementara:
```tsx
<Route index element={<TestPage />} />
```

Setelah backend server berjalan, baru kembalikan ke:
```tsx  
<Route index element={<DashboardPage />} />
```
