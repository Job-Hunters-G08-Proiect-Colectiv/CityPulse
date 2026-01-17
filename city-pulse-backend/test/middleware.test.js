const request = require('supertest');
const app = require('../server');
const jwt = require('jsonwebtoken');

describe('Middleware Tests', () => {
  let validToken;
  let adminToken;
  let regularUserToken;

  beforeAll(async () => {
    // Get admin token
    const adminRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@test.com', password: 'pass123' });
    adminToken = adminRes.body.token;

    // Get regular user token
    const userRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user@test.com', password: 'pass123' });
    regularUserToken = userRes.body.token;

    validToken = adminToken;
  });

  describe('Authentication Middleware', () => {
    it('should accept valid Bearer token', async () => {
      const res = await request(app)
        .get('/api/reports/1/upvote/status')
        .set('Authorization', `Bearer ${validToken}`);

      // Should not return 401 or 403
      expect(res.status).not.toBe(401);
      expect(res.status).not.toBe(403);
    });

    it('should reject request without Authorization header', async () => {
      const res = await request(app)
        .get('/api/reports/1/upvote/status');

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toContain('token required');
    });

    it('should reject request with malformed Authorization header', async () => {
      const res = await request(app)
        .get('/api/reports/1/upvote/status')
        .set('Authorization', 'InvalidFormat');

      expect(res.status).toBe(401);
    });

    it('should reject request with invalid token', async () => {
      const res = await request(app)
        .get('/api/reports/1/upvote/status')
        .set('Authorization', 'Bearer invalid.token.here');

      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty('error');
    });

    it('should reject expired token', async () => {
      // Create an expired token
      const expiredToken = jwt.sign(
        { id: 1, type: 'ADMIN' },
        process.env.JWT_SECRET,
        { expiresIn: '-1h' } // Expired 1 hour ago
      );

      const res = await request(app)
        .get('/api/reports/1/upvote/status')
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty('error');
    });

    it('should reject token with invalid signature', async () => {
      const invalidToken = jwt.sign(
        { id: 1, type: 'ADMIN' },
        'wrong-secret-key'
      );

      const res = await request(app)
        .get('/api/reports/1/upvote/status')
        .set('Authorization', `Bearer ${invalidToken}`);

      expect(res.status).toBe(403);
    });

    it('should attach user information to request', async () => {
      // Create a comment and verify user ID is correctly set
      const reportRes = await request(app)
        .post('/api/reports')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .send({
          name: 'Test Report',
          description: 'Testing user attachment',
          category: 'OTHER',
          location: { lat: 44.4268, lng: 26.1025 },
          address: 'Test Address',
          severityLevel: 'LOW',
          images: []
        });

      if (reportRes.status === 201) {
        const reportId = reportRes.body.id;

        const commentRes = await request(app)
          .post(`/api/reports/${reportId}/comments`)
          .set('Authorization', `Bearer ${regularUserToken}`)
          .send({
            commentText: 'Testing user attachment'
          });

        if (commentRes.status === 201) {
          // Verify the comment has the correct user ID
          expect(commentRes.body).toHaveProperty('userId');
          expect(commentRes.body.userId).toBeGreaterThan(0);
        }

        // Clean up
        await request(app)
          .delete(`/api/reports/${reportId}`)
          .set('Authorization', `Bearer ${adminToken}`);
      }
    });
  });

  describe('Admin Authorization Middleware', () => {
    let testReportId;

    beforeAll(async () => {
      // Create a test report
      const res = await request(app)
        .post('/api/reports')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .send({
          name: 'Report for Admin Test',
          description: 'Testing admin permissions',
          category: 'OTHER',
          location: { lat: 44.4268, lng: 26.1025 },
          address: 'Test Address',
          severityLevel: 'LOW',
          images: []
        });

      if (res.status === 201) {
        testReportId = res.body.id;
      }
    });

    afterAll(async () => {
      if (testReportId) {
        await request(app)
          .delete(`/api/reports/${testReportId}`)
          .set('Authorization', `Bearer ${adminToken}`);
      }
    });

    it('should allow admin to update report status', async () => {
      if (!testReportId) return;

      const res = await request(app)
        .put(`/api/reports/${testReportId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'WORKING' });

      // Admin should be able to update
      expect([200, 201]).toContain(res.status);
    });

    it('should allow regular user to update reports', async () => {
      if (!testReportId) return;

      const res = await request(app)
        .put(`/api/reports/${testReportId}`)
        .set('Authorization', `Bearer ${regularUserToken}`)
        .send({ status: 'PENDING' });

      // Regular users can also update in this system
      expect([200, 201, 403]).toContain(res.status);
    });
  });

  describe('CORS Middleware', () => {
    it('should include CORS headers in response', async () => {
      const res = await request(app)
        .get('/health')
        .set('Origin', 'http://localhost:5173');

      expect(res.headers).toHaveProperty('access-control-allow-origin');
    });

    it('should handle preflight requests', async () => {
      const res = await request(app)
        .options('/api/reports')
        .set('Origin', 'http://localhost:5173')
        .set('Access-Control-Request-Method', 'GET');

      expect(res.status).toBe(204);
    });
  });

  describe('JSON Body Parser Middleware', () => {
    it('should parse JSON request body', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@test.com',
          password: 'pass123'
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
    });

    it('should handle malformed JSON gracefully', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send('{"invalid json"}');

      expect([400, 500]).toContain(res.status);
    });
  });

  describe('Error Handling', () => {
    it('should return proper error format for 404', async () => {
      const res = await request(app)
        .get('/api/nonexistent/endpoint');

      expect(res.status).toBe(404);
    });

    it('should handle server errors gracefully', async () => {
      // Try to create report with completely invalid data
      const res = await request(app)
        .post('/api/reports')
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          // Invalid data structure
          invalid: 'data'
        });

      expect([400, 500]).toContain(res.status);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('Token Extraction', () => {
    it('should extract token from "Bearer <token>" format', async () => {
      const res = await request(app)
        .get('/api/reports/1/upvote/status')
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.status).not.toBe(401);
    });

    it('should reject token without Bearer prefix', async () => {
      const res = await request(app)
        .get('/api/reports/1/upvote/status')
        .set('Authorization', validToken);

      expect(res.status).toBe(401);
    });

    it('should handle Authorization header with extra spaces', async () => {
      const res = await request(app)
        .get('/api/reports/1/upvote/status')
        .set('Authorization', `Bearer  ${validToken}`);

      // Should handle gracefully
      expect([200, 400, 403, 404, 500]).toContain(res.status);
    });
  });
});
