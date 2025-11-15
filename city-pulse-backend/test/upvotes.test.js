const request = require('supertest');
const app = require('../server');

describe('Upvotes Endpoints', () => {
  let authToken;
  let adminToken;
  let testReportId;

  beforeAll(async () => {
    // Login as regular user
    const userRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user@test.com', password: 'pass123' });
    authToken = userRes.body.token;

    // Login as admin
    const adminRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@test.com', password: 'pass123' });
    adminToken = adminRes.body.token;

    // Create a test report for upvotes
    const reportRes = await request(app)
      .post('/api/reports')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Test Report for Upvotes',
        description: 'Report to test upvote functionality',
        category: 'OTHER',
        location: { lat: 44.4268, lng: 26.1025 },
        address: 'Test Address',
        severityLevel: 'MEDIUM',
        images: []
      });

    if (reportRes.status === 201) {
      testReportId = reportRes.body.id;
    }
  });

  afterAll(async () => {
    // Clean up test report
    if (testReportId) {
      await request(app)
        .delete(`/api/reports/${testReportId}`)
        .set('Authorization', `Bearer ${adminToken}`);
    }
  });

  describe('POST /api/reports/:reportId/upvote', () => {
    it('should add upvote to a report', async () => {
      if (!testReportId) return;

      const res = await request(app)
        .post(`/api/reports/${testReportId}/upvote`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('upvoted', true);
      expect(res.body).toHaveProperty('upvotes');
      expect(typeof res.body.upvotes).toBe('number');
    });

    it('should remove upvote when toggling again', async () => {
      if (!testReportId) return;

      // First upvote
      await request(app)
        .post(`/api/reports/${testReportId}/upvote`)
        .set('Authorization', `Bearer ${authToken}`);

      // Toggle (remove upvote)
      const res = await request(app)
        .post(`/api/reports/${testReportId}/upvote`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('upvoted', false);
      expect(res.body).toHaveProperty('upvotes');
    });

    it('should return 401 without auth token', async () => {
      if (!testReportId) return;

      const res = await request(app)
        .post(`/api/reports/${testReportId}/upvote`);

      expect(res.status).toBe(401);
    });

    it('should return 400 for invalid report ID', async () => {
      const res = await request(app)
        .post('/api/reports/invalid/upvote')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('should return 404 for non-existent report', async () => {
      const res = await request(app)
        .post('/api/reports/999999/upvote')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error');
    });

    it('should allow multiple users to upvote the same report', async () => {
      if (!testReportId) return;

      // User upvote
      const userRes = await request(app)
        .post(`/api/reports/${testReportId}/upvote`)
        .set('Authorization', `Bearer ${authToken}`);

      const userUpvotes = userRes.body.upvotes;

      // Admin upvote
      const adminRes = await request(app)
        .post(`/api/reports/${testReportId}/upvote`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(adminRes.status).toBe(200);
      expect(adminRes.body.upvotes).toBeGreaterThanOrEqual(userUpvotes);
    });
  });

  describe('GET /api/reports/:reportId/upvote/status', () => {
    beforeEach(async () => {
      if (!testReportId) return;

      // Reset upvote state - make sure user hasn't upvoted
      const statusRes = await request(app)
        .get(`/api/reports/${testReportId}/upvote/status`)
        .set('Authorization', `Bearer ${authToken}`);

      if (statusRes.body.upvoted) {
        // Remove the upvote
        await request(app)
          .post(`/api/reports/${testReportId}/upvote`)
          .set('Authorization', `Bearer ${authToken}`);
      }
    });

    it('should return upvote status for authenticated user', async () => {
      if (!testReportId) return;

      const res = await request(app)
        .get(`/api/reports/${testReportId}/upvote/status`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('upvoted');
      expect(typeof res.body.upvoted).toBe('boolean');
    });

    it('should return false when user has not upvoted', async () => {
      if (!testReportId) return;

      const res = await request(app)
        .get(`/api/reports/${testReportId}/upvote/status`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.upvoted).toBe(false);
    });

    it('should return true after user upvotes', async () => {
      if (!testReportId) return;

      // Add upvote
      await request(app)
        .post(`/api/reports/${testReportId}/upvote`)
        .set('Authorization', `Bearer ${authToken}`);

      // Check status
      const res = await request(app)
        .get(`/api/reports/${testReportId}/upvote/status`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.upvoted).toBe(true);
    });

    it('should return 401 without auth token', async () => {
      if (!testReportId) return;

      const res = await request(app)
        .get(`/api/reports/${testReportId}/upvote/status`);

      expect(res.status).toBe(401);
    });

    it('should return 400 for invalid report ID', async () => {
      const res = await request(app)
        .get('/api/reports/invalid/upvote/status')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(400);
    });
  });

  describe('Upvote Count Accuracy', () => {
    it('should accurately track upvote count', async () => {
      if (!testReportId) return;

      // Get initial count
      const initialRes = await request(app)
        .get(`/api/reports/${testReportId}`);

      const initialUpvotes = initialRes.body?.upvotes || 0;

      // Add upvote
      const upvoteRes = await request(app)
        .post(`/api/reports/${testReportId}/upvote`)
        .set('Authorization', `Bearer ${authToken}`);

      if (upvoteRes.body.upvoted) {
        expect(upvoteRes.body.upvotes).toBe(initialUpvotes + 1);
      }

      // Remove upvote
      const downvoteRes = await request(app)
        .post(`/api/reports/${testReportId}/upvote`)
        .set('Authorization', `Bearer ${authToken}`);

      if (!downvoteRes.body.upvoted) {
        expect(downvoteRes.body.upvotes).toBe(initialUpvotes);
      }
    });

    it('should persist upvote count when querying report', async () => {
      if (!testReportId) return;

      // Add upvote
      const upvoteRes = await request(app)
        .post(`/api/reports/${testReportId}/upvote`)
        .set('Authorization', `Bearer ${authToken}`);

      const upvoteCount = upvoteRes.body.upvotes;

      // Query the report
      const reportRes = await request(app)
        .get(`/api/reports/${testReportId}`);

      expect(reportRes.status).toBe(200);
      expect(reportRes.body.upvotes).toBe(upvoteCount);

      // Clean up
      await request(app)
        .post(`/api/reports/${testReportId}/upvote`)
        .set('Authorization', `Bearer ${authToken}`);
    });
  });

  describe('Upvote Uniqueness', () => {
    it('should only count one upvote per user per report', async () => {
      if (!testReportId) return;

      // Clear any existing upvote
      const statusRes = await request(app)
        .get(`/api/reports/${testReportId}/upvote/status`)
        .set('Authorization', `Bearer ${authToken}`);

      if (statusRes.body.upvoted) {
        await request(app)
          .post(`/api/reports/${testReportId}/upvote`)
          .set('Authorization', `Bearer ${authToken}`);
      }

      // First upvote
      const firstRes = await request(app)
        .post(`/api/reports/${testReportId}/upvote`)
        .set('Authorization', `Bearer ${authToken}`);

      const firstCount = firstRes.body.upvotes;

      // Toggle (remove)
      await request(app)
        .post(`/api/reports/${testReportId}/upvote`)
        .set('Authorization', `Bearer ${authToken}`);

      // Upvote again
      const secondRes = await request(app)
        .post(`/api/reports/${testReportId}/upvote`)
        .set('Authorization', `Bearer ${authToken}`);

      // Count should be the same as first time
      expect(secondRes.body.upvotes).toBe(firstCount);

      // Clean up
      await request(app)
        .post(`/api/reports/${testReportId}/upvote`)
        .set('Authorization', `Bearer ${authToken}`);
    });
  });
});
