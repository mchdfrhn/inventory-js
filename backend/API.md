# Manajemen Inventaris API Documentation

## Base URL
```
http://localhost:8080/api/v1
```

## Authentication
Currently, the API does not require authentication.

## Common Response Format

### Success Response
```json
{
    "status": "success",
    "message": "Operation successful",
    "data": {}  // Contains the response data
}
```

### Error Response
```json
{
    "status": "error",
    "message": "Error description"
}
```

### Paginated Response
```json
{
    "status": "success",
    "message": "Data retrieved successfully",
    "data": [],  // Array of items
    "pagination": {
        "current_page": 1,
        "page_size": 10,
        "total_items": 100,
        "total_pages": 10,
        "has_previous": false,
        "has_next": true
    }
}
```

## Asset Categories

### Create Category
`POST /categories`

Creates a new asset category.

#### Request Body
```json
{
    "name": "Electronics",
    "description": "Electronic devices and equipment"
}
```

#### Response
```json
{
    "status": "success",
    "message": "Category created successfully",
    "data": {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "name": "Electronics",
        "description": "Electronic devices and equipment",
        "created_at": "2025-05-17T10:00:00Z",
        "updated_at": "2025-05-17T10:00:00Z"
    }
}
```

### Update Category
`PUT /categories/{id}`

Updates an existing category.

#### Request Body
```json
{
    "name": "Office Electronics",
    "description": "Electronic devices for office use"
}
```

#### Response
```json
{
    "status": "success",
    "message": "Category updated successfully",
    "data": {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "name": "Office Electronics",
        "description": "Electronic devices for office use",
        "created_at": "2025-05-17T10:00:00Z",
        "updated_at": "2025-05-17T10:30:00Z"
    }
}
```

### Delete Category
`DELETE /categories/{id}`

Deletes a category. Will fail if there are assets associated with it.

#### Response
```json
{
    "status": "success",
    "message": "Category deleted successfully"
}
```

### Get Category
`GET /categories/{id}`

Retrieves a single category by ID.

#### Response
```json
{
    "status": "success",
    "message": "Category retrieved successfully",
    "data": {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "name": "Office Electronics",
        "description": "Electronic devices for office use",
        "created_at": "2025-05-17T10:00:00Z",
        "updated_at": "2025-05-17T10:30:00Z"
    }
}
```

### List Categories
`GET /categories`

Retrieves a paginated list of categories.

#### Query Parameters
- `page`: Page number (default: 1)
- `page_size`: Number of items per page (default: 10, max: 100)

#### Response
```json
{
    "status": "success",
    "message": "Categories retrieved successfully",
    "data": [
        {
            "id": "123e4567-e89b-12d3-a456-426614174000",
            "name": "Office Electronics",
            "description": "Electronic devices for office use",
            "created_at": "2025-05-17T10:00:00Z",
            "updated_at": "2025-05-17T10:30:00Z"
        }
    ],
    "pagination": {
        "current_page": 1,
        "page_size": 10,
        "total_items": 1,
        "total_pages": 1,
        "has_previous": false,
        "has_next": false
    }
}
```

## Assets

### Create Asset
`POST /assets`

Creates a new asset.

#### Request Body
```json
{
    "kode": "LAPTOP-001",
    "nama": "Laptop Dell XPS 15",
    "spesifikasi": "Core i7, 16GB RAM, 512GB SSD, NVIDIA RTX 3050",
    "quantity": 5,
    "satuan": "unit",
    "tanggal_perolehan": "2025-05-01",
    "harga_perolehan": 15000000,
    "umur_ekonomis_tahun": 4,
    "keterangan": "Termasuk charger dan tas laptop",
    "lokasi": "Gedung A, Ruang 101",
    "category_id": "123e4567-e89b-12d3-a456-426614174000"
}
```

#### Response
```json
{
    "status": "success",
    "message": "Asset created successfully",
    "data": {
        "id": "123e4567-e89b-12d3-a456-426614174001",
        "kode": "LAPTOP-001",
        "nama": "Laptop Dell XPS 15",
        "spesifikasi": "Core i7, 16GB RAM, 512GB SSD, NVIDIA RTX 3050",
        "quantity": 5,
        "satuan": "unit",
        "tanggal_perolehan": "2025-05-01T00:00:00Z",
        "harga_perolehan": 15000000,
        "umur_ekonomis_tahun": 4,
        "umur_ekonomis_bulan": 48,
        "akumulasi_penyusutan": 312500,
        "nilai_sisa": 14687500,
        "keterangan": "Termasuk charger dan tas laptop",
        "lokasi": "Gedung A, Ruang 101",
        "category_id": "123e4567-e89b-12d3-a456-426614174000",
        "created_at": "2025-05-17T11:00:00Z",
        "updated_at": "2025-05-17T11:00:00Z"
    }
}
```

### Update Asset
`PUT /assets/{id}`

Updates an existing asset.

#### Request Body
```json
{
    "kode": "LAPTOP-001",
    "nama": "Laptop Dell XPS 15 2025",
    "spesifikasi": "Core i9, 32GB RAM, 1TB SSD, NVIDIA RTX 3060",
    "quantity": 4,
    "satuan": "unit",
    "tanggal_perolehan": "2025-04-15",
    "harga_perolehan": 18000000,
    "umur_ekonomis_tahun": 5,
    "keterangan": "Termasuk charger, tas laptop dan docking station",
    "lokasi": "Gedung B, Ruang 202",
    "category_id": "123e4567-e89b-12d3-a456-426614174000"
}
```

#### Response
```json
{
    "status": "success",
    "message": "Asset updated successfully",
    "data": {
        "id": "123e4567-e89b-12d3-a456-426614174001",
        "kode": "LAPTOP-001",
        "nama": "Laptop Dell XPS 15 2025",
        "spesifikasi": "Core i9, 32GB RAM, 1TB SSD, NVIDIA RTX 3060",
        "quantity": 4,
        "satuan": "unit",
        "tanggal_perolehan": "2025-04-15T00:00:00Z",
        "harga_perolehan": 18000000,
        "umur_ekonomis_tahun": 5,
        "umur_ekonomis_bulan": 60,
        "akumulasi_penyusutan": 600000,
        "nilai_sisa": 17400000,
        "keterangan": "Termasuk charger, tas laptop dan docking station",
        "lokasi": "Gedung B, Ruang 202",
        "category_id": "123e4567-e89b-12d3-a456-426614174000",
        "created_at": "2025-05-17T11:00:00Z",
        "updated_at": "2025-05-17T11:30:00Z"
    }
}
```

### Delete Asset
`DELETE /assets/{id}`

Soft deletes an asset (marks it as deleted but keeps the record).

#### Response
```json
{
    "status": "success",
    "message": "Asset deleted successfully"
}
```

### Delete Bulk Assets
`DELETE /assets/bulk/{bulk_id}`

Deletes all assets in a bulk group by bulk_id.

#### Parameters
- `bulk_id` (UUID): The bulk ID of the assets to delete

#### Response
```json
{
    "status": "success",
    "message": "All bulk assets deleted successfully"
}
```

### Get Asset
`GET /assets/{id}`

Retrieves a single asset by ID.

#### Response
```json
{
    "status": "success",
    "message": "Asset retrieved successfully",
    "data": {
        "id": "123e4567-e89b-12d3-a456-426614174001",
        "kode": "LAPTOP-001",
        "nama": "Laptop Dell XPS 15",
        "spesifikasi": "Core i7, 16GB RAM, 512GB SSD, NVIDIA RTX 3050",
        "quantity": 5,
        "satuan": "unit",
        "tanggal_perolehan": "2025-05-01T00:00:00Z",
        "harga_perolehan": 15000000,
        "umur_ekonomis_tahun": 4,
        "umur_ekonomis_bulan": 48,
        "akumulasi_penyusutan": 312500,
        "nilai_sisa": 14687500,
        "keterangan": "Termasuk charger dan tas laptop",
        "lokasi": "Gedung A, Ruang 101",
        "category_id": "123e4567-e89b-12d3-a456-426614174000",
        "category": {
            "id": "123e4567-e89b-12d3-a456-426614174000",
            "name": "Elektronik Kantor"
        },
        "created_at": "2025-05-17T11:00:00Z",
        "updated_at": "2025-05-17T11:30:00Z"
    }
}
```

### List Assets
`GET /assets`

Retrieves a paginated list of assets.

#### Query Parameters
- `page`: Page number (default: 1)
- `page_size`: Number of items per page (default: 10, max: 100)
- `category_id`: Filter by category ID (optional)

#### Response
```json
{
    "status": "success",
    "message": "Assets retrieved successfully",
    "data": [
        {
            "id": "123e4567-e89b-12d3-a456-426614174001",
            "kode": "LAPTOP-001",
            "nama": "Laptop Dell XPS 15",
            "spesifikasi": "Core i7, 16GB RAM, 512GB SSD, NVIDIA RTX 3050",
            "quantity": 5,
            "satuan": "unit",
            "tanggal_perolehan": "2025-05-01T00:00:00Z",
            "harga_perolehan": 15000000,
            "umur_ekonomis_tahun": 4,
            "umur_ekonomis_bulan": 48,
            "akumulasi_penyusutan": 312500,
            "nilai_sisa": 14687500,
            "keterangan": "Termasuk charger dan tas laptop",
            "lokasi": "Gedung A, Ruang 101",
            "category_id": "123e4567-e89b-12d3-a456-426614174000",
            "category": {
                "id": "123e4567-e89b-12d3-a456-426614174000",
                "name": "Elektronik Kantor"
            },
            "created_at": "2025-05-17T11:00:00Z",
            "updated_at": "2025-05-17T11:30:00Z"
        }
    ],
    "pagination": {
        "current_page": 1,
        "page_size": 10,
        "total_items": 1,
        "total_pages": 1,
        "has_previous": false,
        "has_next": false
    }
}
```

## Status Values

Assets can have the following status values:
- `available`: Asset is available for use
- `in_use`: Asset is currently being used
- `maintenance`: Asset is under maintenance
- `disposed`: Asset has been disposed of

## Error Codes

Common HTTP status codes:

- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request body or parameters
- `404 Not Found`: Resource not found
- `422 Unprocessable Entity`: Validation error
- `500 Internal Server Error`: Server error
