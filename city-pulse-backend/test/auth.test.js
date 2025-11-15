const request = require('supertest');
const app = require('../server');
const jwt = require('jsonwebtoken');

describe('Authentication Endpoints', () => {
  describe('POST /api/auth/signup', () => {
    it('should create a new user with valid data', async () => {
      const uniqueEmail = `test${Date.now()}@example.com`;
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          username: 'TestUser',
          email: uniqueEmail,
          password: 'password123'
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('user');
      expect(res.body.user).toHaveProperty('email', uniqueEmail);
      expect(res.body.user).not.toHaveProperty('password'); // Password should not be returned
    });

    it('should return 400 when email is already registered', async () => {
      // Use the existing admin email
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          username: 'AdminUser2',
          email: 'admin@test.com',
          password: 'password123'
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('should return 400 when required fields are missing', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          username: 'TestUser'
          // Missing email and password
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully with correct credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@test.com',
          password: 'pass123'
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user).toHaveProperty('email', 'admin@test.com');
      expect(res.body.user).toHaveProperty('type', 'ADMIN');
      expect(res.body.user).not.toHaveProperty('password');

      // Verify token is valid
      const decoded = jwt.verify(res.body.token, process.env.JWT_SECRET);
      expect(decoded).toHaveProperty('id');
      expect(decoded).toHaveProperty('type', 'ADMIN');
    });

    it('should return 401 with incorrect password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@test.com',
          password: 'wrongpassword'
        });

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error');
    });

    it('should return 401 with non-existent email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@test.com',
          password: 'password123'
        });

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error');
    });

    it('should return 401 when required fields are missing', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@test.com'
          // Missing password
        });

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('JWT Token Validation', () => {
    it('should accept valid JWT token', async () => {
      // First, login to get a token
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@test.com',
          password: 'pass123'
        });

      const token = loginRes.body.token;

      // Try to access a protected endpoint (upvote requires auth)
      const res = await request(app)
        .get('/api/reports/1/upvote/status')
        .set('Authorization', `Bearer ${token}`);

      // Should not return 401 or 403
      expect([200, 404, 500]).toContain(res.status);
    });

    it('should reject request without token', async () => {
      const res = await request(app)
        .get('/api/reports/1/upvote/status');

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error');
    });

    it('should reject request with invalid token', async () => {
      const res = await request(app)
        .get('/api/reports/1/upvote/status')
        .set('Authorization', 'Bearer invalid_token_here');

      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('User Roles and Permissions', () => {
    it('should identify admin user correctly', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@test.com',
          password: 'pass123'
        });

      expect(res.status).toBe(200);
      expect(res.body.user.type).toBe('ADMIN');
    });

    it('should identify regular user correctly', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'user@test.com',
          password: 'pass123'
        });

      expect(res.status).toBe(200);
      expect(res.body.user.type).toBe('REGULAR');
    });
  });
});
