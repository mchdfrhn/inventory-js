const request = require('supertest');
const app = require('../src/app');

describe('STTPU Inventory API Tests', () => {
  let createdCategoryId;
  let createdLocationId;
  let createdAssetId;
  let createdBulkId;
  let categoryCode;
  let locationCode;

  beforeAll(async () => {
    // Setup: Ensure database is connected
    // In a real test environment, you might want to use a test database
    const timestamp = Date.now();
    categoryCode = `TEST${timestamp}`;
    locationCode = `LOC${timestamp}`;
  });

  afterAll(async () => {
    // Cleanup: Close any connections
  });

  describe('Health Endpoints', () => {
    test('GET /health should return 200', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('version');
    });

    test('GET /health/detailed should return 200', async () => {
      const response = await request(app).get('/health/detailed');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('database');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('memory');
    });
  });

  describe('Asset Categories API', () => {
    test('GET /api/v1/categories should return 200', async () => {
      const response = await request(app).get('/api/v1/categories');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('POST /api/v1/categories should create category', async () => {
      const categoryData = {
        code: categoryCode,
        name: `Test Category ${categoryCode}`,
        description: 'Category for testing',
      };

      const response = await request(app)
        .post('/api/v1/categories')
        .send(categoryData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('code', categoryCode);

      createdCategoryId = response.body.data.id;
    });

    test('GET /api/v1/categories/:id should return category', async () => {
      if (createdCategoryId) {
        const response = await request(app).get(`/api/v1/categories/${createdCategoryId}`);
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('id', createdCategoryId);
        expect(response.body.data).toHaveProperty('code', categoryCode);
      }
    });

    test('GET /api/v1/categories/code/:code should return category', async () => {
      const response = await request(app).get(`/api/v1/categories/code/${categoryCode}`);
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('code', categoryCode);
    });

    test('PUT /api/v1/categories/:id should update category', async () => {
      if (createdCategoryId) {
        const updateData = {
          name: `Updated Test Category ${categoryCode}`,
          description: 'Updated description',
        };

        const response = await request(app)
          .put(`/api/v1/categories/${createdCategoryId}`)
          .send(updateData);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('name', `Updated Test Category ${categoryCode}`);
      }
    });

    test('POST /api/v1/categories with invalid data should return 400', async () => {
      const invalidData = {
        invalid_field: 'invalid_value',
      };

      const response = await request(app)
        .post('/api/v1/categories')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
    });

    test('POST /api/v1/categories with duplicate code should return 400', async () => {
      const duplicateData = {
        code: categoryCode,
        name: 'Duplicate Category',
        description: 'This should fail',
      };

      const response = await request(app)
        .post('/api/v1/categories')
        .send(duplicateData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('Locations API', () => {
    test('GET /api/v1/locations should return 200', async () => {
      const response = await request(app).get('/api/v1/locations');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('POST /api/v1/locations should create location', async () => {
      const locationData = {
        code: locationCode,
        name: `Test Location ${locationCode}`,
        building: 'Building A',
        floor: '1',
        room: '101',
        description: 'Test location',
      };

      const response = await request(app)
        .post('/api/v1/locations')
        .send(locationData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('code', locationCode);

      createdLocationId = response.body.data.id;
    });

    test('GET /api/v1/locations/:id should return location', async () => {
      if (createdLocationId) {
        const response = await request(app).get(`/api/v1/locations/${createdLocationId}`);
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('id', createdLocationId);
      }
    });

    test('GET /api/v1/locations/code/:code should return location', async () => {
      const response = await request(app).get(`/api/v1/locations/code/${locationCode}`);
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('code', locationCode);
    });

    test('GET /api/v1/locations/search should return filtered locations', async () => {
      const response = await request(app).get('/api/v1/locations/search?query=Test&page=1&pageSize=10');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
    });

    test('PUT /api/v1/locations/:id should update location', async () => {
      if (createdLocationId) {
        const updateData = {
          name: `Updated Test Location ${locationCode}`,
          building: 'Building B',
        };

        const response = await request(app)
          .put(`/api/v1/locations/${createdLocationId}`)
          .send(updateData);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      }
    });
  });

  describe('Assets API', () => {
    test('GET /api/v1/assets should return 200', async () => {
      const response = await request(app).get('/api/v1/assets');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('POST /api/v1/assets should create asset', async () => {
      if (createdCategoryId && createdLocationId) {
        const assetNumber = `AST${Date.now()}`;
        const assetData = {
          kode: assetNumber,
          nama: 'Test Asset',
          spesifikasi: 'Test asset for API testing',
          satuan: 'unit',
          tanggal_perolehan: '2024-01-01',
          harga_perolehan: 1000000,
          asal_pengadaan: 'Test Source',
          category_id: createdCategoryId,
          lokasi_id: createdLocationId,
          status: 'baik',
        };

        const response = await request(app)
          .post('/api/v1/assets')
          .send(assetData);

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('data');
        expect(response.body.data).toHaveProperty('kode', assetNumber);

        createdAssetId = response.body.data.id;
      }
    });

    test('GET /api/v1/assets/:id should return asset', async () => {
      if (createdAssetId) {
        const response = await request(app).get(`/api/v1/assets/${createdAssetId}`);
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('id', createdAssetId);
      }
    });

    test('PUT /api/v1/assets/:id should update asset', async () => {
      if (createdAssetId) {
        const updateData = {
          nama: 'Updated Test Asset',
          status: 'rusak',
        };

        const response = await request(app)
          .put(`/api/v1/assets/${createdAssetId}`)
          .send(updateData);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      }
    });

    test('GET /api/v1/assets with search should return filtered assets', async () => {
      const response = await request(app).get('/api/v1/assets?search=Test&page=1&pageSize=10');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('pagination');
    });

    test('GET /api/v1/assets/with-bulk should return assets with bulk view', async () => {
      const response = await request(app).get('/api/v1/assets/with-bulk');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
    });

    test('POST /api/v1/assets with invalid data should return 400', async () => {
      const invalidData = {
        name: 'Asset without required fields',
      };

      const response = await request(app)
        .post('/api/v1/assets')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('Bulk Operations API', () => {
    test('POST /api/v1/assets/bulk should create bulk assets', async () => {
      if (createdCategoryId && createdLocationId) {
        const bulkData = {
          kode: `BULK${Date.now()}`,
          nama: 'Bulk Asset Test',
          spesifikasi: 'Bulk assets for testing',
          satuan: 'unit',
          tanggal_perolehan: '2024-01-01',
          harga_perolehan: 500000,
          asal_pengadaan: 'Test Bulk Source',
          category_id: createdCategoryId,
          lokasi_id: createdLocationId,
          quantity: 2,
          status: 'baik',
        };

        const response = await request(app)
          .post('/api/v1/assets/bulk')
          .send(bulkData);

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('data');

        if (response.body.data && response.body.data.length > 0) {
          createdBulkId = response.body.data[0].bulk_id;
        }
      }
    });

    test('GET /api/v1/assets/bulk/:bulk_id should return bulk assets', async () => {
      if (createdBulkId) {
        const response = await request(app).get(`/api/v1/assets/bulk/${createdBulkId}`);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('data');
        expect(Array.isArray(response.body.data)).toBe(true);
      }
    });

    test('PUT /api/v1/assets/bulk/:bulk_id should update bulk assets', async () => {
      if (createdBulkId) {
        const updateData = {
          nama: 'Updated Bulk Asset',
          spesifikasi: 'Bulk updated description',
        };

        const response = await request(app)
          .put(`/api/v1/assets/bulk/${createdBulkId}`)
          .send(updateData);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('success', true);
      }
    });
  });

  describe('Audit Logs API', () => {
    test('GET /api/v1/audit-logs should return 200', async () => {
      const response = await request(app).get('/api/v1/audit-logs');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('GET /api/v1/audit-logs with pagination should return 200', async () => {
      const response = await request(app).get('/api/v1/audit-logs?page=1&limit=5');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('pagination');
    });

    test('GET /api/v1/audit-logs/history/:entityType/:entityId should return entity history', async () => {
      if (createdAssetId) {
        const response = await request(app).get(`/api/v1/audit-logs/history/asset/${createdAssetId}`);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('data');
      }
    });
  });

  describe('Error Handling', () => {
    test('GET non-existent asset should return 404', async () => {
      const response = await request(app).get('/api/v1/assets/123e4567-e89b-12d3-a456-426614174000');
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('success', false);
    });

    test('GET non-existent category should return 404', async () => {
      const response = await request(app).get('/api/v1/categories/123e4567-e89b-12d3-a456-426614174000');
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('success', false);
    });

    test('GET non-existent location should return 404', async () => {
      const response = await request(app).get('/api/v1/locations/99999');
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('success', false);
    });

    test('GET unknown route should return 404', async () => {
      const response = await request(app).get('/api/v1/unknown');
      expect(response.status).toBe(404);
    });

    test('POST malformed JSON should return 400', async () => {
      const response = await request(app)
        .post('/api/v1/assets')
        .send('{"invalid": json}')
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(400);
    });
  });

  describe('Pagination and Filtering', () => {
    test('GET /api/v1/assets with pagination should return correct structure', async () => {
      const response = await request(app).get('/api/v1/assets?page=1&pageSize=5');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.pagination).toHaveProperty('page', 1);
      expect(response.body.pagination).toHaveProperty('pageSize', 5);
    });

    test('GET /api/v1/assets with invalid pagination should return 400', async () => {
      const response = await request(app).get('/api/v1/assets?page=0&limit=1000');
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
    });

    test('GET /api/v1/assets with category filter should return filtered results', async () => {
      if (createdCategoryId) {
        const response = await request(app).get(`/api/v1/assets?category_id=${createdCategoryId}`);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('success', true);
      }
    });

    test('GET /api/v1/assets with location filter should return filtered results', async () => {
      if (createdLocationId) {
        const response = await request(app).get(`/api/v1/assets?location_id=${createdLocationId}`);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('success', true);
      }
    });

    test('GET /api/v1/assets with sorting should return sorted results', async () => {
      const response = await request(app).get('/api/v1/assets?sort_by=name&sort_order=asc');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
    });
  });

  // Cleanup tests - run last
  describe('Cleanup', () => {
    test('DELETE created asset', async () => {
      if (createdAssetId) {
        const response = await request(app).delete(`/api/v1/assets/${createdAssetId}`);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('success', true);
      }
    });

    test('DELETE bulk assets', async () => {
      if (createdBulkId) {
        const response = await request(app).delete(`/api/v1/assets/bulk/${createdBulkId}`);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('success', true);
      }
    });

    test('DELETE created location', async () => {
      if (createdLocationId) {
        const response = await request(app).delete(`/api/v1/locations/${createdLocationId}`);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('success', true);
      }
    });

    test('DELETE created category', async () => {
      if (createdCategoryId) {
        const response = await request(app).delete(`/api/v1/categories/${createdCategoryId}`);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('success', true);
      }
    });
  });
});
