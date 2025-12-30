# API Documentation - STTPU Inventory Management System

This document provides detailed information about the backend API for the STTPU Inventory Management System.

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
   ```

5. **Create a User (Penting!)**

   Karena tidak ada user default, Anda harus membuat user baru untuk bisa login. Gunakan endpoint registrasi berikut.

   ```bash
   curl -X POST http://localhost:8080/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "username": "admin",
       "password": "password",
       "fullName": "Admin User"
     }'
   ```
   
   > **Catatan:** Di lingkungan pengembangan, database akan di-reset setiap kali server dimulai ulang. Anda perlu membuat ulang user setiap kali me-restart server.

6. **Start application**
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

### Authentication

#### Register a New User
- **Endpoint:** `POST /api/auth/register`
- **Description:** Register a new user to the system.
- **Request Body:** `application/json`
  ```json
  {
    "username": "yourusername",
    "password": "yourpassword",
    "fullName": "Your Full Name"
  }
  ```
- **Validation Rules:**
  - `username`: (string, required) - Must be alphanumeric, between 3 and 30 characters.
  - `password`: (string, required) - Must be between 6 and 255 characters.
  - `fullName`: (string, optional) - Maximum 255 characters.
- **Success Response (201):**
  ```json
  {
    "success": true,
    "message": "User registered successfully",
    "data": {
        "id": "cfa3f7e0-69b6-4c48-8a8b-3e35c7e0bfe7",
        "username": "yourusername",
        "fullName": "Your Full Name",
        "role": "user",
        "created_at": "2025-12-30T10:00:00.000Z",
        "updated_at": "2025-12-30T10:00:00.000Z"
    }
  }
  ```

#### Login
- **Endpoint:** `POST /api/auth/login`
- **Description:** Login to get a JWT token.
- **Request Body:** `application/json`
  ```json
  {
    "username": "yourusername",
    "password": "yourpassword"
  }
  ```
- **Validation Rules:**
  - `username`: (string, required)
  - `password`: (string, required)
- **Success Response (200):**
  ```json
  {
    "success": true,
    "message": "Login successful",
    "data": {
      "token": "your.jwt.token"
    }
  }
  ```

> **Note on Protected Routes:**
> Endpoints marked with a 🔒 require a valid JWT. You must include it in the request header like this:
> `Authorization: Bearer <your_jwt_token>`

### Asset Management

#### List Assets
- **Endpoint:** `GET /api/v1/assets`
- **Description:** Retrieves a paginated list of assets with filtering options.
- **Query Parameters:** See `assetFilterSchema` below.
- **Success Response (200):**
  ```json
  {
    "success": true,
    "message": "Assets retrieved successfully",
    "data": {
      "total": 1,
      "page": 1,
      "pageSize": 10,
      "assets": [
        {
          "id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
          "kode": "ASSET001",
          "nama": "Laptop Pro",
          "spesifikasi": "16GB RAM, 512GB SSD",
          "quantity": 1,
          "satuan": "unit",
          "tanggal_perolehan": "2023-01-15T00:00:00.000Z",
          "harga_perolehan": 1500,
          "umur_ekonomis_tahun": 5,
          "umur_ekonomis_bulan": 60,
          "akumulasi_penyusutan": 300,
          "nilai_sisa": 1200,
          "keterangan": "For developer",
          "lokasi_id": 1,
          "category_id": "cfa3f7e0-69b6-4c48-8a8b-3e35c7e0bfe7",
          "status": "baik",
          "created_at": "2025-12-30T10:00:00.000Z",
          "updated_at": "2025-12-30T10:00:00.000Z"
        }
      ]
    }
  }
  ```

#### Get Asset by ID
- **Endpoint:** `GET /api/v1/assets/:id`
- **Description:** Retrieves a single asset by its ID.
- **URL Parameters:**
  - `id`: (string, required) - The UUID of the asset.
- **Success Response (200):** (similar to the asset object in the list response)

#### 🔒 Create New Asset
- **Endpoint:** `POST /api/v1/assets`
- **Description:** Creates a new single asset.
- **Request Body:** `application/json` (see `createAssetSchema` in `backend/src/validations/schemas.js`)
- **Success Response (201):** (returns the created asset object)

#### 🔒 Update Asset
- **Endpoint:** `PUT /api/v1/assets/:id`
- **Description:** Updates an existing asset.
- **URL Parameters:**
  - `id`: (string, required) - The UUID of the asset.
- **Request Body:** `application/json` (see `updateAssetSchema` in `backend/src/validations/schemas.js`)
- **Success Response (200):** (returns the updated asset object)

#### 🔒 Delete Asset
- **Endpoint:** `DELETE /api/v1/assets/:id`
- **Description:** Deletes an asset. Requires 'admin' role.
- **URL Parameters:**
  - `id`: (string, required) - The UUID of the asset.
- **Success Response (200):**
  ```json
  {
    "success": true,
    "message": "Asset deleted successfully",
    "data": null
  }
  ```

#### Bulk Asset Operations

#### 🔒 Create Bulk Assets
- **Endpoint:** `POST /api/v1/assets/bulk`
- **Description:** Creates multiple assets in a single operation.
- **Request Body:** `application/json` (see `createBulkAssetSchema` in `backend/src/validations/schemas.js`)
- **Success Response (201):**
  ```json
  {
      "success": true,
      "message": "Bulk assets created successfully",
      "data": {
          "bulk_id": "b1c2d3e4-f5g6-7890-1234-567890abcdef",
          "createdCount": 10
      }
  }
  ```

#### Get Bulk Assets
- **Endpoint:** `GET /api/v1/assets/bulk/:bulk_id`
- **Description:** Retrieves all assets belonging to a bulk operation.
- **URL Parameters:**
  - `bulk_id`: (string, required) - The UUID of the bulk operation.
- **Success Response (200):** (returns a list of asset objects)

#### 🔒 Update Bulk Assets
- **Endpoint:** `PUT /api/v1/assets/bulk/:bulk_id`
- **Description:** Updates all assets belonging to a bulk operation.
- **URL Parameters:**
  - `bulk_id`: (string, required) - The UUID of the bulk operation.
- **Request Body:** `application/json` (see `bulkUpdateAssetSchema` in `backend/src/validations/schemas.js`)
- **Success Response (200):**
  ```json
  {
      "success": true,
      "message": "Bulk assets updated successfully",
      "data": {
          "updatedCount": 10
      }
  }
  ```

#### 🔒 Delete Bulk Assets
- **Endpoint:** `DELETE /api/v1/assets/bulk/:bulk_id`
- **Description:** Deletes all assets belonging to a bulk operation. Requires 'admin' role.
- **URL Parameters:**
  - `bulk_id`: (string, required) - The UUID of the bulk operation.
- **Success Response (200):**
  ```json
  {
      "success": true,
      "message": "Bulk assets deleted successfully",
      "data": {
          "deletedCount": 10
      }
  }
  ```

#### List Assets with Bulk View
- **Endpoint:** `GET /api/v1/assets/with-bulk`
- **Description:** List assets with bulk view information.
- **Query Parameters:** See `assetFilterSchema` below.
- **Success Response (200):** (similar to list assets but with bulk info)


#### Import/Export

#### 🔒 Import Assets from CSV
- **Endpoint:** `POST /api/v1/assets/import`
- **Description:** Imports assets from a CSV file.
- **Request Body:** `multipart/form-data`
  - `file`: (file, required) - A CSV file with asset data. See documentation for required columns.
- **Success Response (200):**
  ```json
  {
    "success": true,
    "message": "Assets imported successfully",
    "data": {
      "successCount": 5,
      "errorCount": 0,
      "errors": []
    }
  }
  ```

#### Export Assets to CSV
- **Endpoint:** `GET /api/v1/assets/export`
- **Description:** Exports assets to a CSV file.
- **Query Parameters:** Can use the same filters as List Assets.
- **Success Response (200):** A CSV file download.

### Asset Categories

#### List Categories
- **Endpoint:** `GET /api/v1/categories`
- **Description:** Retrieves a paginated list of asset categories.
- **Query Parameters:**
  - `page`: (integer, optional, default: 1) - The page number to retrieve.
  - `pageSize`: (integer, optional, default: 10) - The number of items per page.
  - `search`: (string, optional) - A search term to filter categories by name or code.
- **Success Response (200):**
  ```json
  {
    "success": true,
    "message": "Categories retrieved successfully",
    "data": {
      "total": 1,
      "page": 1,
      "pageSize": 10,
      "categories": [
        {
          "id": "cfa3f7e0-69b6-4c48-8a8b-3e35c7e0bfe7",
          "code": "CAT001",
          "name": "Electronics",
          "description": "Electronic devices",
          "created_at": "2025-12-30T10:00:00.000Z",
          "updated_at": "2025-12-30T10:00:00.000Z"
        }
      ]
    }
  }
  ```

#### Get Category by ID
- **Endpoint:** `GET /api/v1/categories/:id`
- **Description:** Retrieves a single asset category by its ID.
- **URL Parameters:**
  - `id`: (string, required) - The UUID of the category.
- **Success Response (200):**
  ```json
  {
    "success": true,
    "message": "Category retrieved successfully",
    "data": {
      "id": "cfa3f7e0-69b6-4c48-8a8b-3e35c7e0bfe7",
      "code": "CAT001",
      "name": "Electronics",
      "description": "Electronic devices",
      "created_at": "2025-12-30T10:00:00.000Z",
      "updated_at": "2025-12-30T10:00:00.000Z"
    }
  }
  ```

#### Get Category by Code
- **Endpoint:** `GET /api/v1/categories/code/:code`
- **Description:** Retrieves a single asset category by its code.
- **URL Parameters:**
  - `code`: (string, required) - The code of the category.
- **Success Response (200):**
  ```json
  {
    "success": true,
    "message": "Category retrieved successfully",
    "data": {
      "id": "cfa3f7e0-69b6-4c48-8a8b-3e35c7e0bfe7",
      "code": "CAT001",
      "name": "Electronics",
      "description": "Electronic devices",
      "created_at": "2025-12-30T10:00:00.000Z",
      "updated_at": "2025-12-30T10:00:00.000Z"
    }
  }
  ```

#### 🔒 Create Category
- **Endpoint:** `POST /api/v1/categories`
- **Description:** Creates a new asset category.
- **Request Body:** `application/json`
  ```json
  {
    "code": "CAT002",
    "name": "Furniture",
    "description": "Office furniture"
  }
  ```
- **Validation Rules:**
  - `code`: (string, optional) - Max 50 characters.
  - `name`: (string, required) - Max 255 characters.
  - `description`: (string, optional).
- **Success Response (201):**
  ```json
  {
    "success": true,
    "message": "Category created successfully",
    "data": {
      "id": "d8f4g8e1-79c7-5d59-9b9c-4f46d8f1cde8",
      "code": "CAT002",
      "name": "Furniture",
      "description": "Office furniture",
      "created_at": "2025-12-30T10:05:00.000Z",
      "updated_at": "2025-12-30T10:05:00.000Z"
    }
  }
  ```

#### 🔒 Update Category
- **Endpoint:** `PUT /api/v1/categories/:id`
- **Description:** Updates an existing asset category.
- **URL Parameters:**
  - `id`: (string, required) - The UUID of the category.
- **Request Body:** `application/json`
  ```json
  {
    "name": "Updated Furniture Name",
    "description": "Updated description for office furniture"
  }
  ```
- **Validation Rules:**
  - `code`: (string, optional) - Max 50 characters.
  - `name`: (string, optional) - Max 255 characters.
  - `description`: (string, optional).
- **Success Response (200):**
  ```json
  {
    "success": true,
    "message": "Category updated successfully",
    "data": {
      "id": "d8f4g8e1-79c7-5d59-9b9c-4f46d8f1cde8",
      "code": "CAT002",
      "name": "Updated Furniture Name",
      "description": "Updated description for office furniture",
      "created_at": "2025-12-30T10:05:00.000Z",
      "updated_at": "2025-12-30T10:10:00.000Z"
    }
  }
  ```

#### 🔒 Delete Category
- **Endpoint:** `DELETE /api/v1/categories/:id`
- **Description:** Deletes an asset category.
- **URL Parameters:**
  - `id`: (string, required) - The UUID of the category.
- **Success Response (200):**
  ```json
  {
    "success": true,
    "message": "Category deleted successfully",
    "data": null
  }
  ```

#### 🔒 Import Categories
- **Endpoint:** `POST /api/v1/categories/import`
- **Description:** Imports asset categories from a CSV file.
- **Request Body:** `multipart/form-data`
  - `file`: (file, required) - A CSV file with columns: `code`, `name`, `description`. The header must be present.
- **Success Response (200):**
  ```json
  {
    "success": true,
    "message": "Categories imported successfully",
    "data": {
      "successCount": 5,
      "errorCount": 0,
      "errors": []
    }
  }
  ```

### Locations

#### List Locations
- **Endpoint:** `GET /api/v1/locations`
- **Description:** Retrieves a paginated list of locations.
- **Query Parameters:**
  - `page`: (integer, optional, default: 1) - The page number to retrieve.
  - `pageSize`: (integer, optional, default: 10) - The number of items per page.
  - `search`: (string, optional) - A search term to filter locations by name, code, or building.
- **Success Response (200):**
  ```json
  {
    "success": true,
    "message": "Locations retrieved successfully",
    "data": {
      "total": 1,
      "page": 1,
      "pageSize": 10,
      "locations": [
        {
          "id": 1,
          "code": "LOK001",
          "name": "Main Office",
          "description": "Main office building",
          "building": "A",
          "floor": "1",
          "room": "101",
          "created_at": "2025-12-30T10:00:00.000Z",
          "updated_at": "2025-12-30T10:00:00.000Z"
        }
      ]
    }
  }
  ```

#### Get Location by ID
- **Endpoint:** `GET /api/v1/locations/:id`
- **Description:** Retrieves a single location by its ID.
- **URL Parameters:**
  - `id`: (integer, required) - The ID of the location.
- **Success Response (200):**
  ```json
  {
    "success": true,
    "message": "Location retrieved successfully",
    "data": {
      "id": 1,
      "code": "LOK001",
      "name": "Main Office",
      "description": "Main office building",
      "building": "A",
      "floor": "1",
      "room": "101",
      "created_at": "2025-12-30T10:00:00.000Z",
      "updated_at": "2025-12-30T10:00:00.000Z"
    }
  }
  ```

#### Get Location by Code
- **Endpoint:** `GET /api/v1/locations/code/:code`
- **Description:** Retrieves a single location by its code.
- **URL Parameters:**
  - `code`: (string, required) - The code of the location.
- **Success Response (200):**
  ```json
  {
    "success": true,
    "message": "Location retrieved successfully",
    "data": {
      "id": 1,
      "code": "LOK001",
      "name": "Main Office",
      "description": "Main office building",
      "building": "A",
      "floor": "1",
      "room": "101",
      "created_at": "2025-12-30T10:00:00.000Z",
      "updated_at": "2025-12-30T10:00:00.000Z"
    }
  }
  ```

#### Search Locations
- **Endpoint:** `GET /api/v1/locations/search`
- **Description:** Searches for locations based on a query.
- **Query Parameters:**
  - `query`: (string, required) - The search term.
  - `page`: (integer, optional, default: 1)
  - `pageSize`: (integer, optional, default: 10)
- **Success Response (200):**
  ```json
  {
    "success": true,
    "message": "Locations retrieved successfully",
    "data": {
      "total": 1,
      "page": 1,
      "pageSize": 10,
      "locations": [
        {
          "id": 1,
          "code": "LOK001",
          "name": "Main Office",
          "description": "Main office building",
          "building": "A",
          "floor": "1",
          "room": "101",
          "created_at": "2025-12-30T10:00:00.000Z",
          "updated_at": "2025-12-30T10:00:00.000Z"
        }
      ]
    }
  }
  ```

#### 🔒 Create Location
- **Endpoint:** `POST /api/v1/locations`
- **Description:** Creates a new location.
- **Request Body:** `application/json`
  ```json
  {
    "code": "LOK002",
    "name": "Warehouse",
    "description": "Storage warehouse",
    "building": "B",
    "floor": "1",
    "room": "WH-1"
  }
  ```
- **Validation Rules:**
  - `code`: (string, optional) - Max 50 characters.
  - `name`: (string, required) - Max 255 characters.
  - `description`: (string, optional).
  - `building`: (string, optional) - Max 255 characters.
  - `floor`: (string, optional) - Max 50 characters.
  - `room`: (string, optional) - Max 100 characters.
- **Success Response (201):**
  ```json
  {
    "success": true,
    "message": "Location created successfully",
    "data": {
      "id": 2,
      "code": "LOK002",
      "name": "Warehouse",
      "description": "Storage warehouse",
      "building": "B",
      "floor": "1",
      "room": "WH-1",
      "created_at": "2025-12-30T10:05:00.000Z",
      "updated_at": "2025-12-30T10:05:00.000Z"
    }
  }
  ```

#### 🔒 Update Location
- **Endpoint:** `PUT /api/v1/locations/:id`
- **Description:** Updates an existing location.
- **URL Parameters:**
  - `id`: (integer, required) - The ID of the location.
- **Request Body:** `application/json`
  ```json
  {
    "name": "Main Warehouse",
    "description": "Main storage warehouse"
  }
  ```
- **Validation Rules:**
  - `code`: (string, optional) - Max 50 characters.
  - `name`: (string, optional) - Max 255 characters.
  - `description`: (string, optional).
  - `building`: (string, optional) - Max 255 characters.
  - `floor`: (string, optional) - Max 50 characters.
  - `room`: (string, optional) - Max 100 characters.
- **Success Response (200):**
  ```json
  {
    "success": true,
    "message": "Location updated successfully",
    "data": {
      "id": 2,
      "code": "LOK002",
      "name": "Main Warehouse",
      "description": "Main storage warehouse",
      "building": "B",
      "floor": "1",
      "room": "WH-1",
      "created_at": "2025-12-30T10:05:00.000Z",
      "updated_at": "2025-12-30T10:10:00.000Z"
    }
  }
  ```

#### 🔒 Delete Location
- **Endpoint:** `DELETE /api/v1/locations/:id`
- **Description:** Deletes a location.
- **URL Parameters:**
  - `id`: (integer, required) - The ID of the location.
- **Success Response (200):**
  ```json
  {
    "success": true,
    "message": "Location deleted successfully",
    "data": null
  }
  ```

#### 🔒 Import Locations
- **Endpoint:** `POST /api/v1/locations/import`
- **Description:** Imports locations from a CSV file.
- **Request Body:** `multipart/form-data`
  - `file`: (file, required) - A CSV file with columns: `code`, `name`, `description`, `building`, `floor`, `room`. The header must be present.
- **Success Response (200):**
  ```json
  {
    "success": true,
    "message": "Locations imported successfully",
    "data": {
      "successCount": 5,
      "errorCount": 0,
      "errors": []
    }
  }
  ```

### Audit Logs

#### List Audit Logs
- **Endpoint:** `GET /api/v1/audit-logs`
- **Description:** Retrieves a paginated list of audit logs with filtering options.
- **Query Parameters:** See `auditLogFilterSchema` for all available filters (e.g., `page`, `pageSize`, `entity_type`, `action`, `user_id`, date ranges).
- **Success Response (200):**
  ```json
  {
    "success": true,
    "message": "Audit logs retrieved successfully",
    "data": {
      "total": 1,
      "page": 1,
      "pageSize": 10,
      "logs": [
        {
          "id": 1,
          "entity_type": "asset",
          "entity_id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
          "action": "create",
          "old_values": null,
          "new_values": { "nama": "Laptop Pro" },
          "user_id": "cfa3f7e0-69b6-4c48-8a8b-3e35c7e0bfe7",
          "timestamp": "2025-12-30T10:00:00.000Z"
        }
      ]
    }
  }
  ```

#### Get Activity History for Entity
- **Endpoint:** `GET /api/v1/audit-logs/history/:entityType/:entityId`
- **Description:** Retrieves the complete history of actions for a specific entity.
- **URL Parameters:**
  - `entityType`: (string, required) - The type of the entity (e.g., 'asset', 'category', 'location').
  - `entityId`: (string, required) - The ID of the entity.
- **Success Response (200):** (returns a list of audit log objects for that entity)

#### 🔒 Cleanup Old Logs
- **Endpoint:** `POST /api/v1/audit-logs/cleanup`
- **Description:** Deletes audit logs older than a specified retention period (e.g., 90 days). Requires 'admin' role.
- **Success Response (200):**
  ```json
  {
    "success": true,
    "message": "Old audit logs cleaned up successfully",
    "data": {
      "deletedCount": 50
    }
  }
  ```

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
