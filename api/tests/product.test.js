const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const Product = require('../models/Product');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;
let adminToken;
let userToken;
let productId;
let nonExistentProductId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri(), { useUnifiedTopology: true });
});

afterAll(async () => {
  await mongoose.connection.close();
  await mongoServer.stop();
});

describe('Product API Tests', () => {
  // Before each test: clean up the MongoDB database and insert a new test product and users
  beforeEach(async () => {
    await Product.deleteMany({});
    await User.deleteMany({});

    // Create an admin user
    const adminUser = new User({ name: 'Admin', email: 'admin@example.com', password: 'adminpass', roles: ['admin'] });
    await adminUser.save();
    const payloadAdmin = { user: { id: adminUser.id, roles: adminUser.roles } };
    adminToken = jwt.sign(payloadAdmin, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Create a regular user
    const normalUser = new User({ name: 'User', email: 'user@example.com', password: 'userpass', roles: ['user'] });
    await normalUser.save();
    const payloadNormalUser = { user: { id: normalUser.id, roles: normalUser.roles } };
    userToken = jwt.sign(payloadNormalUser, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Create a test product
    const product = new Product({ name: 'Test Product', price: 10, category: 'Electronics', quantity: 5 });
    await product.save();
    productId = product._id.toString();

    // Generate a valid but non-existent ID
    nonExistentProductId = new mongoose.Types.ObjectId().toString();
  });

  test('GET / - Should return a paginated list of products', async () => {
    const res = await request(app)
      .get('/api/products')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data).toHaveProperty('products');
    expect(res.body.data.products.length).toBeGreaterThan(0);
  });

  test('GET /:id - Should return a product by ID', async () => {
    const res = await request(app)
      .get(`/api/products/${productId}`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.product._id).toBe(productId);
  });

  test('GET /:id - Should return a 400 error for an invalid ID', async () => {
    const res = await request(app)
      .get('/api/products/invalidID')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Invalid product ID');
  });

  test('GET /:id - Should return a 404 error for a non-existent product', async () => {
    const res = await request(app)
      .get(`/api/products/${nonExistentProductId}`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe('Product not found');
  });

  test('POST / - Should create a product (admin only)', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'New Product', price: 20, category: 'Electronics', quantity: 3 });

    expect(res.statusCode).toBe(201);
    expect(res.body.data.product.name).toBe('New Product');
  });

  test('POST / - Should return an error if the name is empty', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: '', price: 20, category: 'Electronics', quantity: 3 });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Name is required');
  });

  test('POST / - Should return an error if the price is negative', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'New Product', price: -5, category: 'Electronics', quantity: 3 });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Price must be a non-negative number');
  });

  test('POST / - Should return an error if the category is invalid', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'New Product', price: 20, category: 'Invalid', quantity: 3 });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Invalid category');
  });

  test('POST / - Should return an error if the quantity is negative', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'New Product', price: 20, category: 'Electronics', quantity: -3 });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Quantity must be a non-negative integer');
  });

  test('POST / - Should return an error if the description is not a string', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'New Product', price: 20, category: 'Electronics', quantity: 3, description: 123 });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Description must be a string');
  });

  test('PUT /:id - Should update an existing product (admin only)', async () => {
    const res = await request(app)
      .put(`/api/products/${productId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ price: 15 });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.product.price).toBe(15);
  });

  test('PUT /:id - Should return an error if the name is empty', async () => {
    const res = await request(app)
      .put(`/api/products/${productId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: '' });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Name cannot be empty');
  });

  test('PUT /:id - Should return an error if the price is negative', async () => {
    const res = await request(app)
      .put(`/api/products/${productId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ price: -5 });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Price must be a non-negative number');
  });

  test('PUT /:id - Should return an error if the category is invalid', async () => {
    const res = await request(app)
      .put(`/api/products/${productId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ category: 'Invalid' });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Invalid category');
  });

  test('PUT /:id - Should return an error if the quantity is negative', async () => {
    const res = await request(app)
      .put(`/api/products/${productId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ quantity: -3 });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Quantity must be a non-negative integer');
  });

  test('PUT /:id - Should return an error if the description is not a string', async () => {
    const res = await request(app)
      .put(`/api/products/${productId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ description: 123 });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Description must be a string');
  });

  test('PUT /:id - Should return a 404 error for a non-existent product', async () => {
    const res = await request(app)
      .put(`/api/products/${nonExistentProductId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ price: 15 });

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe('Product not found');
  });

  test('DELETE /:id - Should delete an existing product (admin only)', async () => {
    const res = await request(app)
      .delete(`/api/products/${productId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Product successfully removed');
  });

  test('DELETE /:id - Should return a 400 error for an invalid ID', async () => {
    const res = await request(app)
      .delete('/api/products/invalidID')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Invalid product ID');
  });

  test('DELETE /:id - Should return a 404 error for a non-existent product', async () => {
    const res = await request(app)
      .delete(`/api/products/${nonExistentProductId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe('Product not found');
  });

  // Check authorization
  test('POST / - Should return 401 if not authenticated', async () => {
    const res = await request(app)
      .post('/api/products')
      .send({ name: 'New Product', price: 20, category: 'Electronics', quantity: 3 });

    expect(res.statusCode).toBe(401);
  });

  test('POST / - Should return 403 if user is not an admin', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ name: 'New Product', price: 20, category: 'Electronics', quantity: 3 });

    expect(res.statusCode).toBe(403);
  });

  test('PUT /:id - Should return 401 if not authenticated', async () => {
    const res = await request(app)
      .put(`/api/products/${productId}`)
      .send({ price: 15 });

    expect(res.statusCode).toBe(401);
  });

  test('PUT /:id - Should return 403 if user is not an admin', async () => {
    const res = await request(app)
      .put(`/api/products/${productId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ price: 15 });

    expect(res.statusCode).toBe(403);
  });

  test('DELETE /:id - Should return 401 if not authenticated', async () => {
    const res = await request(app)
      .delete(`/api/products/${productId}`);

    expect(res.statusCode).toBe(401);
  });

  test('DELETE /:id - Should return 403 if user is not an admin', async () => {
    const res = await request(app)
      .delete(`/api/products/${productId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toBe(403);
  });
});