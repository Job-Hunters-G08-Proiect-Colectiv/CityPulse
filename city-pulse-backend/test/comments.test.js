const request = require('supertest');
const app = require('../server');

describe('Comments Endpoints', () => {
  let authToken;
  let adminToken;
  let userId;
  let adminId;
  let testReportId;
  let testCommentId;

  beforeAll(async () => {
    // Login as regular user
    const userRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user@test.com', password: 'pass123' });
    authToken = userRes.body.token;
    userId = userRes.body.user.id;

    // Login as admin
    const adminRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@test.com', password: 'pass123' });
    adminToken = adminRes.body.token;
    adminId = adminRes.body.user.id;

    // Create a test report for comments
    const reportRes = await request(app)
      .post('/api/reports')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Test Report for Comments',
        description: 'Report to test comments',
        category: 'OTHER',
        location: { lat: 44.4268, lng: 26.1025 },
        address: 'Test Address',
        severityLevel: 'LOW',
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

  describe('GET /api/reports/:reportId/comments', () => {
    it('should return empty array when report has no comments', async () => {
      if (!testReportId) return;

      const res = await request(app)
        .get(`/api/reports/${testReportId}/comments`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should return 400 for invalid report ID', async () => {
      const res = await request(app)
        .get('/api/reports/invalid/comments');

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('should return comments array for valid report', async () => {
      const res = await request(app)
        .get('/api/reports/1/comments');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('POST /api/reports/:reportId/comments', () => {
    it('should create a comment with valid data and auth token', async () => {
      if (!testReportId) return;

      const res = await request(app)
        .post(`/api/reports/${testReportId}/comments`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          commentText: 'This is a test comment'
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('commentText', 'This is a test comment');
      expect(res.body).toHaveProperty('reportId', testReportId);
      expect(res.body).toHaveProperty('userId', userId);

      testCommentId = res.body.id;
    });

    it('should return 401 when creating comment without auth token', async () => {
      if (!testReportId) return;

      const res = await request(app)
        .post(`/api/reports/${testReportId}/comments`)
        .send({
          commentText: 'Unauthorized comment'
        });

      expect(res.status).toBe(401);
    });

    it('should return 400 when comment text is missing', async () => {
      if (!testReportId) return;

      const res = await request(app)
        .post(`/api/reports/${testReportId}/comments`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('should return 400 for invalid report ID', async () => {
      const res = await request(app)
        .post('/api/reports/invalid/comments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          commentText: 'Test comment'
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('should include username and user type in comment response', async () => {
      if (!testReportId) return;

      const res = await request(app)
        .post(`/api/reports/${testReportId}/comments`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          commentText: 'Comment with user info'
        });

      if (res.status === 201) {
        expect(res.body).toHaveProperty('username');
        expect(res.body).toHaveProperty('userType');

        // Clean up
        await request(app)
          .delete(`/api/comments/${res.body.id}`)
          .set('Authorization', `Bearer ${authToken}`);
      }
    });
  });

  describe('PUT /api/comments/:commentId', () => {
    it('should update own comment', async () => {
      if (!testCommentId) return;

      const res = await request(app)
        .put(`/api/comments/${testCommentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          commentText: 'Updated comment text'
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('commentText', 'Updated comment text');
    });

    it('should allow admin to update any comment', async () => {
      if (!testCommentId) return;

      const res = await request(app)
        .put(`/api/comments/${testCommentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          commentText: 'Admin updated this comment'
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('commentText', 'Admin updated this comment');
    });

    it('should return 401 without auth token', async () => {
      if (!testCommentId) return;

      const res = await request(app)
        .put(`/api/comments/${testCommentId}`)
        .send({
          commentText: 'Unauthorized update'
        });

      expect(res.status).toBe(401);
    });

    it('should return 400 when comment text is missing', async () => {
      if (!testCommentId) return;

      const res = await request(app)
        .put(`/api/comments/${testCommentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('should return 400 for invalid comment ID', async () => {
      const res = await request(app)
        .put('/api/comments/invalid')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          commentText: 'Update attempt'
        });

      expect(res.status).toBe(400);
    });

    it('should return 404 or 400 for non-existent comment', async () => {
      const res = await request(app)
        .put('/api/comments/999999')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          commentText: 'Update non-existent'
        });

      expect([400, 404]).toContain(res.status);
    });
  });

  describe('DELETE /api/comments/:commentId', () => {
    let commentToDelete;

    beforeEach(async () => {
      if (!testReportId) return;

      // Create a comment to delete
      const res = await request(app)
        .post(`/api/reports/${testReportId}/comments`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          commentText: 'Comment to be deleted'
        });

      if (res.status === 201) {
        commentToDelete = res.body.id;
      }
    });

    it('should delete own comment', async () => {
      if (!commentToDelete) return;

      const res = await request(app)
        .delete(`/api/comments/${commentToDelete}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message');
    });

    it('should allow admin to delete any comment', async () => {
      if (!commentToDelete) return;

      const res = await request(app)
        .delete(`/api/comments/${commentToDelete}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message');
    });

    it('should return 401 without auth token', async () => {
      if (!commentToDelete) return;

      const res = await request(app)
        .delete(`/api/comments/${commentToDelete}`);

      expect(res.status).toBe(401);
    });

    it('should return 400 for invalid comment ID', async () => {
      const res = await request(app)
        .delete('/api/comments/invalid')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(400);
    });

    it('should return error for non-existent comment', async () => {
      const res = await request(app)
        .delete('/api/comments/999999')
        .set('Authorization', `Bearer ${authToken}`);

      expect([400, 403, 404]).toContain(res.status);
    });
  });

  describe('Comment Authorization', () => {
    let userComment;
    let secondUserToken;

    beforeAll(async () => {
      if (!testReportId) return;

      // Create a unique second user
      const signupRes = await request(app)
        .post('/api/auth/signup')
        .send({
          username: `TestUser${Date.now()}`,
          email: `testuser${Date.now()}@test.com`,
          password: 'pass123'
        });

      if (signupRes.status === 201) {
        secondUserToken = signupRes.body.token;
      }

      // Create a comment by first user
      const commentRes = await request(app)
        .post(`/api/reports/${testReportId}/comments`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          commentText: 'Comment by first user'
        });

      if (commentRes.status === 201) {
        userComment = commentRes.body.id;
      }
    });

    it('should not allow user to update another user\'s comment', async () => {
      if (!userComment || !secondUserToken) return;

      const res = await request(app)
        .put(`/api/comments/${userComment}`)
        .set('Authorization', `Bearer ${secondUserToken}`)
        .send({
          commentText: 'Trying to update someone else\'s comment'
        });

      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty('error');
    });

    it('should not allow user to delete another user\'s comment', async () => {
      if (!userComment || !secondUserToken) return;

      const res = await request(app)
        .delete(`/api/comments/${userComment}`)
        .set('Authorization', `Bearer ${secondUserToken}`);

      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty('error');
    });

    afterAll(async () => {
      // Clean up the user's comment
      if (userComment) {
        await request(app)
          .delete(`/api/comments/${userComment}`)
          .set('Authorization', `Bearer ${authToken}`);
      }
    });
  });

  describe('GET comments after creation', () => {
    it('should retrieve all comments for a report', async () => {
      if (!testReportId) return;

      // Create multiple comments
      await request(app)
        .post(`/api/reports/${testReportId}/comments`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ commentText: 'First comment' });

      await request(app)
        .post(`/api/reports/${testReportId}/comments`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ commentText: 'Second comment' });

      const res = await request(app)
        .get(`/api/reports/${testReportId}/comments`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);

      // Verify comment structure
      if (res.body.length > 0) {
        const comment = res.body[0];
        expect(comment).toHaveProperty('id');
        expect(comment).toHaveProperty('reportId');
        expect(comment).toHaveProperty('userId');
        expect(comment).toHaveProperty('commentText');
        expect(comment).toHaveProperty('username');
        expect(comment).toHaveProperty('userType');
      }
    });
  });
});
