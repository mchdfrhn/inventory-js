// Load test environment variables
require('dotenv').config({ path: '.env.test' });

const request = require('supertest');
const app = require('../src/app');
const { sequelize } = require('../src/database/connection');

describe('API Health Check', () => {
  test('GET /health should return 200', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);

    expect(response.body).toHaveProperty('status', 'OK');
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body).toHaveProperty('uptime');
  });

  test('GET /health/detailed should return detailed status', async () => {
    const response = await request(app)
      .get('/health/detailed')
      .expect(200);

    expect(response.body).toHaveProperty('status', 'OK');
    expect(response.body).toHaveProperty('database');
    expect(response.body).toHaveProperty('memory');
    expect(response.body).toHaveProperty('uptime');
  });
});

describe('Asset Categories API', () => {
  beforeEach(async () => {
    // Clear all tables before each test
    await sequelize.sync({ force: true });
  });

  test('GET /api/categories should return empty list initially', async () => {
    const response = await request(app)
      .get('/api/categories')
      .expect(200);

    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toBeInstanceOf(Array);
    expect(response.body.data).toHaveLength(0);
  });

  test('POST /api/categories should create new category', async () => {
    const categoryData = {
      code: 'TEST001',
      name: 'Test Category',
      description: 'This is a test category'
    };

    const response = await request(app)
      .post('/api/categories')
      .send(categoryData)
      .expect(201);

    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toHaveProperty('id');
    expect(response.body.data.code).toBe(categoryData.code);
    expect(response.body.data.name).toBe(categoryData.name);
    expect(response.body.data.description).toBe(categoryData.description);
  });

  test('GET /api/categories should return the created category', async () => {
    // First create a category
    const categoryData = {
      code: 'TEST002',
      name: 'Test Category 2',
      description: 'This is another test category'
    };

    await request(app)
      .post('/api/categories')
      .send(categoryData)
      .expect(201);

    // Then retrieve it
    const response = await request(app)
      .get('/api/categories')
      .expect(200);

    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].code).toBe('TEST002');
  });
});
