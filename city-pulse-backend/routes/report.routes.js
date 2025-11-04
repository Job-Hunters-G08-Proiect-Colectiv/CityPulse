const express = require('express');
const router = express.Router();
const { authenticateToken, isAdmin } = require('../middleware/auth.middleware');

const {
    httpGetAllReports,
    httpAddNewReport,
    httpDeleteReport,
    httpUpdateReport,
    httpGetReportById
} = require('../controllers/report.controller.js');

// public routes
router.get('/', httpGetAllReports);
router.get('/:id', httpGetReportById);

router.post('/', authenticateToken, httpAddNewReport);

// admin routes
router.put('/:id', authenticateToken, isAdmin, httpUpdateReport);
router.delete('/:id', authenticateToken, isAdmin, httpDeleteReport);

module.exports = router;