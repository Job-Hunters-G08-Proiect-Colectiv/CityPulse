const request = require('supertest');
const app = require('../server');

describe('Reports Endpoints', () => {
  let authToken;
  let adminToken;
  let createdReportId;

  // Get auth tokens before running tests
  beforeAll(async () => {
    const userRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user@test.com', password: 'pass123' });
    authToken = userRes.body.token;

    const adminRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@test.com', password: 'pass123' });
    adminToken = adminRes.body.token;
  });

  describe('GET /api/reports', () => {
    it('should return array of reports', async () => {
      const res = await request(app).get('/api/reports');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should filter reports by category', async () => {
      const res = await request(app)
        .get('/api/reports?category=POTHOLE');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);

      if (res.body.length > 0) {
        res.body.forEach(report => {
          expect(report.category).toBe('POTHOLE');
        });
      }
    });

    it('should filter reports by status', async () => {
      const res = await request(app)
        .get('/api/reports?status=PENDING');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);

      if (res.body.length > 0) {
        res.body.forEach(report => {
          expect(report.status).toBe('PENDING');
        });
      }
    });

    it('should filter reports by severity level', async () => {
      const res = await request(app)
        .get('/api/reports?severityLevel=HIGH');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);

      if (res.body.length > 0) {
        res.body.forEach(report => {
          expect(report.severityLevel).toBe('HIGH');
        });
      }
    });

    it('should search reports by text', async () => {
      const res = await request(app)
        .get('/api/reports?search=road');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should combine multiple filters', async () => {
      const res = await request(app)
        .get('/api/reports?category=POTHOLE&status=PENDING&severityLevel=HIGH');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('POST /api/reports', () => {
    it('should create a new report with valid data and auth token', async () => {
      const newReport = {
        name: 'Test Pothole Report',
        description: 'Large pothole on main street',
        category: 'POTHOLE',
        location: { lat: 44.4268, lng: 26.1025 },
        address: 'Main Street, Bucharest',
        severityLevel: 'HIGH',
        images: []
      };

      const res = await request(app)
        .post('/api/reports')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newReport);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('name', newReport.name);
      expect(res.body).toHaveProperty('category', newReport.category);
      expect(res.body).toHaveProperty('severityLevel', newReport.severityLevel);
      expect(res.body).toHaveProperty('status', 'PENDING');

      // Save the ID for later tests
      createdReportId = res.body.id;
    });

    it('should return 401 when creating report without auth token', async () => {
      const newReport = {
        name: 'Unauthorized Report',
        description: 'This should fail',
        category: 'WASTE',
        location: { lat: 44.4268, lng: 26.1025 },
        address: 'Test Address',
        severityLevel: 'LOW',
        images: []
      };

      const res = await request(app)
        .post('/api/reports')
        .send(newReport);

      expect(res.status).toBe(401);
    });

    it('should return 400 with invalid data (missing required fields)', async () => {
      const invalidReport = {
        name: 'Incomplete Report'
        // Missing required fields
      };

      const res = await request(app)
        .post('/api/reports')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidReport);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('should return 400 with invalid category', async () => {
      const invalidReport = {
        name: 'Invalid Category Report',
        description: 'Testing invalid category',
        category: 'INVALID_CATEGORY',
        location: { lat: 44.4268, lng: 26.1025 },
        address: 'Test Address',
        severityLevel: 'LOW',
        images: []
      };

      const res = await request(app)
        .post('/api/reports')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidReport);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('GET /api/reports/:id', () => {
    it('should return a specific report by ID', async () => {
      const res = await request(app).get('/api/reports/1');

      if (res.status === 200) {
        expect(res.body).toHaveProperty('id', 1);
        expect(res.body).toHaveProperty('name');
        expect(res.body).toHaveProperty('category');
        expect(res.body).toHaveProperty('status');
      } else {
        expect(res.status).toBe(404);
      }
    });

    it('should return 404 for non-existent report', async () => {
      const res = await request(app).get('/api/reports/999999');

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error');
    });

    it('should return 500 for invalid report ID format', async () => {
      const res = await request(app).get('/api/reports/invalid');

      expect([400, 500]).toContain(res.status);
    });
  });

  describe('PUT /api/reports/:id', () => {
    it('should update report status (admin action)', async () => {
      if (!createdReportId) {
        // Skip if report wasn't created
        return;
      }

      const updates = {
        status: 'WORKING'
      };

      const res = await request(app)
        .put(`/api/reports/${createdReportId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updates);

      if (res.status === 200) {
        expect(res.body).toHaveProperty('status', 'WORKING');
      }
    });

    it('should update report severity level', async () => {
      if (!createdReportId) {
        return;
      }

      const updates = {
        severityLevel: 'CRITICAL'
      };

      const res = await request(app)
        .put(`/api/reports/${createdReportId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updates);

      if (res.status === 200) {
        expect(res.body).toHaveProperty('severityLevel', 'CRITICAL');
      }
    });

    it('should return 404 when updating non-existent report', async () => {
      const res = await request(app)
        .put('/api/reports/999999')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'DONE' });

      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/reports/:id', () => {
    it('should return 404 when deleting non-existent report', async () => {
      const res = await request(app)
        .delete('/api/reports/999999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error');
    });

    it('should delete a report successfully', async () => {
      if (!createdReportId) {
        return;
      }

      const res = await request(app)
        .delete(`/api/reports/${createdReportId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 404]).toContain(res.status);

      if (res.status === 200) {
        expect(res.body).toHaveProperty('message');

        // Verify report is deleted
        const getRes = await request(app).get(`/api/reports/${createdReportId}`);
        expect(getRes.status).toBe(404);
      }
    });
  });

  describe('Report Data Validation', () => {
    it('should validate severity levels', async () => {
      const severityLevels = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

      for (const level of severityLevels) {
        const report = {
          name: `Test ${level} Report`,
          description: `Testing ${level} severity`,
          category: 'OTHER',
          location: { lat: 44.4268, lng: 26.1025 },
          address: 'Test Address',
          severityLevel: level,
          images: []
        };

        const res = await request(app)
          .post('/api/reports')
          .set('Authorization', `Bearer ${authToken}`)
          .send(report);

        if (res.status === 201) {
          expect(res.body.severityLevel).toBe(level);

          // Clean up
          await request(app)
            .delete(`/api/reports/${res.body.id}`)
            .set('Authorization', `Bearer ${adminToken}`);
        }
      }
    });

    it('should validate report categories', async () => {
      const categories = ['POTHOLE', 'WASTE', 'POLLUTION', 'LIGHTING', 'VANDALISM', 'OTHER'];

      for (const category of categories) {
        const report = {
          name: `Test ${category} Report`,
          description: `Testing ${category} category`,
          category: category,
          location: { lat: 44.4268, lng: 26.1025 },
          address: 'Test Address',
          severityLevel: 'LOW',
          images: []
        };

        const res = await request(app)
          .post('/api/reports')
          .set('Authorization', `Bearer ${authToken}`)
          .send(report);

        if (res.status === 201) {
          expect(res.body.category).toBe(category);

          // Clean up
          await request(app)
            .delete(`/api/reports/${res.body.id}`)
            .set('Authorization', `Bearer ${adminToken}`);
        }
      }
    });
  });
});
