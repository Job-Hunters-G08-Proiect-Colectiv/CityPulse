const express = require('express');
const router = express.Router();
const {
    httpGetAllReports,
    httpGetReportById,
    httpCreateReport,
    httpUpdateReport,
    httpDeleteReport
} = require('../controllers/report.controller');
const { authenticateToken, isAdmin } = require('../middlewares/auth.middleware');

// Public routes (anyone can view reports)
router.get('/', httpGetAllReports);
router.get('/:id', httpGetReportById);

// Protected routes (must be logged in to create/update)
router.post('/', authenticateToken, httpCreateReport);
router.put('/:id', authenticateToken, httpUpdateReport);

// Admin-only routes
router.delete('/:id', authenticateToken, isAdmin, httpDeleteReport);

module.exports = router;