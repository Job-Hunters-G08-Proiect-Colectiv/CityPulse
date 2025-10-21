const express = require('express');
const router = express.Router();

const {
    httpGetAllReports,
    httpAddNewReport,
    httpDeleteReport
} = require('../controllers/report.controller.js');

router.get('/', httpGetAllReports);
router.post('/', httpAddNewReport);
router.delete('/:id', httpDeleteReport);

module.exports = router;