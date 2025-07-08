# STTPU Inventory Management System - API Documentation

Dokumentasi lengkap untuk REST API STTPU Inventory Management System.

## Base URL
```
http://localhost:8080
```

## Authentication
Currently, the API does not require authentication. All endpoints are publicly accessible for development purposes.

## Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "success": true,
  "data": {
    // Response data
  },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

## Health & System Endpoints

### Get Health Status
Check the health status of the API server.

**Endpoint:** `GET /health`

**Response:**
```json
{
  "status": "ok",
  "time": "2025-07-08T13:46:54.443863974+07:00",
  "service": "STTPU Inventory Management System",
  "version": "v1.0.0",
  "developer": "Mochammad Farhan Ali"
}
```

### Get Version Information
Get detailed version and system information.

**Endpoint:** `GET /version`

**Response:**
```json
{
  "service": "STTPU Inventory Management System",
  "version": "v1.0.0",
  "developer": "Mochammad Farhan Ali",
  "organization": "STTPU",
  "description": "Backend API for inventory asset management",
  "build_time": "2025-01-01"
}
```

## Assets Management

### Create Asset
Create a new asset.

**Endpoint:** `POST /api/v1/assets`

**Request Body:**
```json
{
  "kode": "AST001",
  "nama": "Laptop HP EliteBook",
  "spesifikasi": "Intel i7, 16GB RAM, 512GB SSD",
  "quantity": 1,
  "satuan": "unit",
  "tanggal_perolehan": "2025-01-15T00:00:00Z",
  "harga_perolehan": 15000000,
  "umur_ekonomis_tahun": 3,
  "umur_ekonomis_bulan": 0,
  "category_id": "550e8400-e29b-41d4-a716-446655440000",
  "lokasi_id": 1,
  "asal_pengadaan": "Pembelian Langsung",
  "keterangan": "Laptop untuk keperluan administrasi",
  "status": "baik"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "kode": "AST001",
    "nama": "Laptop HP EliteBook",
    // ... other fields
    "created_at": "2025-07-08T13:46:54Z",
    "updated_at": "2025-07-08T13:46:54Z"
  },
  "message": "Asset created successfully"
}
```

### Get All Assets
Retrieve a list of all assets with pagination.

**Endpoint:** `GET /api/v1/assets`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `pageSize` (optional): Items per page (default: 10)
- `search` (optional): Search term for asset name or code
- `category_id` (optional): Filter by category ID
- `location_id` (optional): Filter by location ID
- `status` (optional): Filter by status

**Example:** `GET /api/v1/assets?page=1&pageSize=10&search=laptop&status=baik`

**Response:**
```json
{
  "success": true,
  "data": {
    "assets": [
      {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "kode": "AST001",
        "nama": "Laptop HP EliteBook",
        "category": {
          "id": "550e8400-e29b-41d4-a716-446655440000",
          "code": "ELK",
          "name": "Elektronik"
        },
        "location_info": {
          "id": 1,
          "name": "Ruang Administrasi",
          "code": "ADM-001"
        }
        // ... other fields
      }
    ],
    "total": 50,
    "page": 1,
    "pageSize": 10,
    "totalPages": 5
  }
}
```

### Get Asset by ID
Retrieve a specific asset by its ID.

**Endpoint:** `GET /api/v1/assets/{id}`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "kode": "AST001",
    "nama": "Laptop HP EliteBook",
    "spesifikasi": "Intel i7, 16GB RAM, 512GB SSD",
    "quantity": 1,
    "satuan": "unit",
    "tanggal_perolehan": "2025-01-15T00:00:00Z",
    "harga_perolehan": 15000000,
    "umur_ekonomis_tahun": 3,
    "umur_ekonomis_bulan": 0,
    "akumulasi_penyusutan": 0,
    "nilai_sisa": 15000000,
    "category": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "code": "ELK",
      "name": "Elektronik",
      "description": "Peralatan elektronik"
    },
    "location_info": {
      "id": 1,
      "name": "Ruang Administrasi",
      "code": "ADM-001",
      "building": "Gedung A",
      "floor": "Lantai 1",
      "room": "Ruang 101"
    },
    "asal_pengadaan": "Pembelian Langsung",
    "keterangan": "Laptop untuk keperluan administrasi",
    "status": "baik",
    "created_at": "2025-07-08T13:46:54Z",
    "updated_at": "2025-07-08T13:46:54Z"
  }
}
```

### Update Asset
Update an existing asset.

**Endpoint:** `PUT /api/v1/assets/{id}`

**Request Body:** Same as Create Asset

**Response:**
```json
{
  "success": true,
  "data": {
    // Updated asset data
  },
  "message": "Asset updated successfully"
}
```

### Delete Asset
Delete an asset by ID.

**Endpoint:** `DELETE /api/v1/assets/{id}`

**Response:**
```json
{
  "success": true,
  "message": "Asset deleted successfully"
}
```

### Create Bulk Assets
Create multiple assets at once.

**Endpoint:** `POST /api/v1/assets/bulk`

**Request Body:**
```json
{
  "nama": "Kursi Kantor",
  "spesifikasi": "Kursi ergonomis dengan sandaran tinggi",
  "quantity": 20,
  "satuan": "unit",
  "tanggal_perolehan": "2025-01-15T00:00:00Z",
  "harga_perolehan": 1500000,
  "umur_ekonomis_tahun": 5,
  "category_id": "550e8400-e29b-41d4-a716-446655440001",
  "lokasi_id": 1,
  "asal_pengadaan": "Tender",
  "keterangan": "Kursi untuk ruang meeting"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "bulk_id": "bulk-123e4567-e89b-12d3-a456-426614174000",
    "assets_created": 20,
    "assets": [
      {
        "id": "asset-1-id",
        "kode": "KURSI-001",
        "bulk_sequence": 1
        // ... other fields
      },
      {
        "id": "asset-2-id", 
        "kode": "KURSI-002",
        "bulk_sequence": 2
        // ... other fields
      }
      // ... up to 20 assets
    ]
  },
  "message": "Bulk assets created successfully"
}
```

### Get Bulk Assets
Retrieve all assets in a bulk group.

**Endpoint:** `GET /api/v1/assets/bulk/{bulk_id}`

**Response:**
```json
{
  "success": true,
  "data": {
    "bulk_id": "bulk-123e4567-e89b-12d3-a456-426614174000",
    "total_count": 20,
    "assets": [
      // Array of assets in the bulk group
    ]
  }
}
```

### Update Bulk Assets
Update all assets in a bulk group.

**Endpoint:** `PUT /api/v1/assets/bulk/{bulk_id}`

**Request Body:** Asset data to update for all assets in the group

### Delete Bulk Assets
Delete all assets in a bulk group.

**Endpoint:** `DELETE /api/v1/assets/bulk/{bulk_id}`

**Response:**
```json
{
  "success": true,
  "message": "Bulk assets deleted successfully",
  "deleted_count": 20
}
```

## Categories Management

### Create Category
Create a new asset category.

**Endpoint:** `POST /api/v1/categories`

**Request Body:**
```json
{
  "code": "ELK",
  "name": "Elektronik",
  "description": "Peralatan dan alat elektronik"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "code": "ELK",
    "name": "Elektronik",
    "description": "Peralatan dan alat elektronik",
    "created_at": "2025-07-08T13:46:54Z",
    "updated_at": "2025-07-08T13:46:54Z"
  },
  "message": "Category created successfully"
}
```

### Get All Categories
Retrieve all asset categories.

**Endpoint:** `GET /api/v1/categories`

**Query Parameters:**
- `page` (optional): Page number
- `pageSize` (optional): Items per page

**Response:**
```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "code": "ELK",
        "name": "Elektronik",
        "description": "Peralatan dan alat elektronik",
        "created_at": "2025-07-08T13:46:54Z",
        "updated_at": "2025-07-08T13:46:54Z"
      }
    ],
    "total": 5,
    "page": 1,
    "pageSize": 10
  }
}
```

### Get Category by ID
Retrieve a specific category.

**Endpoint:** `GET /api/v1/categories/{id}`

### Update Category
Update an existing category.

**Endpoint:** `PUT /api/v1/categories/{id}`

### Delete Category
Delete a category.

**Endpoint:** `DELETE /api/v1/categories/{id}`

### Import Categories
Import categories from file.

**Endpoint:** `POST /api/v1/categories/import`

**Request:** Multipart form data with file upload

## Locations Management

### Create Location
Create a new location.

**Endpoint:** `POST /api/v1/locations`

**Request Body:**
```json
{
  "name": "Ruang Administrasi",
  "code": "ADM-001",
  "description": "Ruang untuk kegiatan administrasi",
  "building": "Gedung A",
  "floor": "Lantai 1",
  "room": "Ruang 101"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Ruang Administrasi",
    "code": "ADM-001",
    "description": "Ruang untuk kegiatan administrasi",
    "building": "Gedung A",
    "floor": "Lantai 1",
    "room": "Ruang 101",
    "created_at": "2025-07-08T13:46:54Z",
    "updated_at": "2025-07-08T13:46:54Z"
  },
  "message": "Location created successfully"
}
```

### Get All Locations
Retrieve all locations.

**Endpoint:** `GET /api/v1/locations`

**Query Parameters:**
- `page` (optional): Page number
- `pageSize` (optional): Items per page

### Search Locations
Search locations by name, code, or building.

**Endpoint:** `GET /api/v1/locations/search`

**Query Parameters:**
- `q`: Search query
- `page` (optional): Page number
- `pageSize` (optional): Items per page

### Get Location by ID
Retrieve a specific location.

**Endpoint:** `GET /api/v1/locations/{id}`

### Update Location
Update an existing location.

**Endpoint:** `PUT /api/v1/locations/{id}`

### Delete Location
Delete a location.

**Endpoint:** `DELETE /api/v1/locations/{id}`

### Import Locations
Import locations from file.

**Endpoint:** `POST /api/v1/locations/import`

## Audit Logs

### Get Audit Logs
Retrieve audit logs with filtering.

**Endpoint:** `GET /api/v1/audit-logs`

**Query Parameters:**
- `page` (optional): Page number
- `pageSize` (optional): Items per page
- `entity_type` (optional): Filter by entity type (assets, categories, locations)
- `action` (optional): Filter by action (create, update, delete)
- `start_date` (optional): Filter by start date
- `end_date` (optional): Filter by end date

**Response:**
```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "id": "log-123e4567-e89b-12d3-a456-426614174000",
        "entity_type": "assets",
        "entity_id": "123e4567-e89b-12d3-a456-426614174000",
        "action": "create",
        "changes": "{\"kode\":\"AST001\",\"nama\":\"Laptop HP EliteBook\"}",
        "old_values": null,
        "new_values": "{\"kode\":\"AST001\",\"nama\":\"Laptop HP EliteBook\"}",
        "user_id": null,
        "ip_address": "127.0.0.1",
        "user_agent": "Mozilla/5.0...",
        "description": "Asset created: Laptop HP EliteBook",
        "created_at": "2025-07-08T13:46:54Z"
      }
    ],
    "total": 100,
    "page": 1,
    "pageSize": 10
  }
}
```

### Get Entity History
Get audit history for a specific entity.

**Endpoint:** `GET /api/v1/audit-logs/entity/{entity_type}/{entity_id}`

**Parameters:**
- `entity_type`: Type of entity (assets, categories, locations)
- `entity_id`: ID of the entity

**Response:**
```json
{
  "success": true,
  "data": {
    "entity_type": "assets",
    "entity_id": "123e4567-e89b-12d3-a456-426614174000",
    "history": [
      {
        "id": "log-1",
        "action": "create",
        "description": "Asset created: Laptop HP EliteBook",
        "created_at": "2025-07-08T13:46:54Z"
      },
      {
        "id": "log-2",
        "action": "update",
        "description": "Asset updated: Status changed to 'baik'",
        "created_at": "2025-07-08T14:30:00Z"
      }
    ]
  }
}
```

## Error Codes

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Input validation failed |
| `NOT_FOUND` | Resource not found |
| `DUPLICATE_KEY` | Duplicate key constraint violation |
| `DATABASE_ERROR` | Database operation failed |
| `INTERNAL_ERROR` | Internal server error |

## Rate Limiting

Currently, no rate limiting is implemented. This may be added in future versions.

## Pagination

All list endpoints support pagination with the following parameters:
- `page`: Page number (starting from 1)
- `pageSize`: Number of items per page (default: 10, max: 100)

Pagination response includes:
- `page`: Current page number
- `pageSize`: Items per page
- `total`: Total number of items
- `totalPages`: Total number of pages

## CORS

CORS is enabled for all origins during development. In production, configure allowed origins appropriately.

## Developer Information

- **API Version**: 1.0.0
- **Developer**: Mochammad Farhan Ali
- **Organization**: STTPU
- **Last Updated**: July 8, 2025

For technical support or questions about the API, please contact the development team.
