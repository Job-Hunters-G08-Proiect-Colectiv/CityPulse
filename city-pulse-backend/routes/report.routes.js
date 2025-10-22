const express = require('express');
const router = express.Router();

const {
    httpGetAllReports,
    httpAddNewReport,
    httpDeleteReport,
    httpUpdateReport,
    httpGetReportById
} = require('../controllers/report.controller.js');

router.get('/', httpGetAllReports);
router.post('/', httpAddNewReport);
router.delete('/:id', httpDeleteReport);
router.get('/:id', httpGetReportById);
router.put('/:id', httpUpdateReport);

module.exports = router;