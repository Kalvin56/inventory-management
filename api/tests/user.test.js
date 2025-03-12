const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app'); // Ensure this points to your Express app
const User = require('../models/User');
const { MongoMemoryServer } = require('mongodb-memory-server');
const bcrypt = require('bcryptjs');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri(), { useUnifiedTopology: true });
});

afterAll(async () => {
  await mongoose.connection.close();
  await mongoServer.stop();
});

describe('Auth API Tests', () => {
  beforeEach(async () => {
    await User.deleteMany({});

    // Create a regular user
    const user = new User({ name: 'User', email: 'user@example.com', password: await bcrypt.hash('password123', 10) });
    await user.save();
  });

  test('POST /register - Should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test', email: 'test@example.com', password: 'password123' });

    expect(res.statusCode).toBe(201);
    expect(res.body.data).toHaveProperty('user');
    expect(res.body.data).toHaveProperty('token');
  });

  test('POST /register - Should return an error if name is missing', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: '', email: 'test@example.com', password: 'password123' });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Name is required and must not exceed 8 characters');
  });

  test('POST /register - Should return an error if email is invalid', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test', email: 'invalid-email', password: 'password123' });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Please include a valid email');
  });

  test('POST /register - Should return an error if password is too short', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test', email: 'test@example.com', password: 'short' });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Password must be at least 6 characters');
  });

  test('POST /register - Should return an error if user already exists', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test', email: 'test@example.com', password: 'password123' });

    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test', email: 'test@example.com', password: 'password123' });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('User already exists');
  });

  test('POST /login - Should login a user and return a token', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user@example.com', password: 'password123' });

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toHaveProperty('user');
    expect(res.body.data).toHaveProperty('token');
  });

  test('POST /login - Should return an error if email is invalid', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'invalid-email', password: 'password123' });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Please include a valid email');
  });

  test('POST /login - Should return an error if password is missing', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user@example.com', password: '' });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Password is required');
  });

  test('POST /login - Should return an error if credentials are invalid', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user@example.com', password: 'wrongpassword' });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Invalid credentials');
  });
});