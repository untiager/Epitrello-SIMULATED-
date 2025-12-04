const request = require('supertest');
const express = require('express');
const fs = require('fs');
const path = require('path');
const authRouter = require('../auth');

// Create a test Express app
const app = express();
app.use(express.json());
app.use('/api/auth', authRouter);

// Mock data paths
const testUsersPath = path.join(__dirname, '../data/users.json');

// Mock fs module
jest.mock('fs');

describe('Auth API Routes', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    // Setup default mock implementation
    fs.readFileSync.mockReturnValue(JSON.stringify([]));
    fs.writeFileSync.mockImplementation(() => {});
    fs.existsSync.mockReturnValue(true);
  });

  describe('POST /api/auth/register', () => {
    test('should register a new user successfully', async () => {
      const newUser = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(newUser)
        .expect(201);

      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('username', 'testuser');
      expect(response.body.user).toHaveProperty('email', 'test@example.com');
      expect(response.body.user).not.toHaveProperty('password');
      expect(fs.writeFileSync).toHaveBeenCalled();
    });

    test('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ username: 'testuser' })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'All fields are required');
    });

    test('should return 409 if user already exists', async () => {
      const existingUsers = [{
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashedpassword'
      }];

      fs.readFileSync.mockReturnValue(JSON.stringify(existingUsers));

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123'
        })
        .expect(409);

      expect(response.body).toHaveProperty('error', 'User already exists');
    });

    test('should handle file write errors', async () => {
      fs.writeFileSync.mockImplementation(() => {
        throw new Error('File write error');
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123'
        })
        .expect(500);

      expect(response.body).toHaveProperty('error', 'Failed to register user');
    });
  });

  describe('POST /api/auth/login', () => {
    const mockUser = {
      id: '1',
      username: 'testuser',
      email: 'test@example.com',
      password: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8' // hash of 'password'
    };

    beforeEach(() => {
      fs.readFileSync.mockReturnValue(JSON.stringify([mockUser]));
    });

    test('should login successfully with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password'
        })
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('username', 'testuser');
      expect(response.body.user).not.toHaveProperty('password');
    });

    test('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com' })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Email and password are required');
    });

    test('should return 401 with invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'wrong@example.com',
          password: 'password'
        })
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Invalid credentials');
    });

    test('should return 401 with invalid password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Invalid credentials');
    });
  });

  describe('GET /api/auth/me', () => {
    const mockUser = {
      id: '123',
      username: 'testuser',
      email: 'test@example.com',
      password: 'hashedpassword'
    };

    beforeEach(() => {
      fs.readFileSync.mockReturnValue(JSON.stringify([mockUser]));
    });

    test('should return user info with valid token', async () => {
      const token = 'sometoken-123';

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('username', 'testuser');
      expect(response.body).toHaveProperty('email', 'test@example.com');
      expect(response.body).not.toHaveProperty('password');
    });

    test('should return 401 if no token provided', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(response.body).toHaveProperty('error', 'No token provided');
    });

    test('should return 401 if token is invalid', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalidtoken-999')
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Invalid token');
    });
  });

  describe('Security', () => {
    test('should hash passwords before storing', async () => {
      const newUser = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'mypassword123'
      };

      await request(app)
        .post('/api/auth/register')
        .send(newUser)
        .expect(201);

      const writeCall = fs.writeFileSync.mock.calls[0];
      const savedData = JSON.parse(writeCall[1]);
      const savedUser = savedData[0];

      expect(savedUser.password).not.toBe('mypassword123');
      expect(savedUser.password).toHaveLength(64); // SHA-256 hash length
    });

    test('should not return password in response', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123'
        })
        .expect(201);

      expect(response.body.user).not.toHaveProperty('password');
    });
  });
});
