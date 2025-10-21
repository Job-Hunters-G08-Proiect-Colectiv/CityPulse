const reportService = require('../services/report.service');

const httpGetAllReports = (req, res) => {
    console.log('Controller: GET /api/reports');
    try {
        const allReports = reportService.getAllReports();
        res.status(200).json(allReports);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

const httpAddNewReport = (req, res) => {
    console.log('Controller: POST /api/reports');

    try {
        const newReport = reportService.addNewReport(req.body);
        res.status(201).json(newReport);

    } catch (error) {
        if (error.message.includes('required') || error.message.includes('Invalid')) {
            console.log('Validation Error:', error.message);
            // 400 = Bad Request (clientul a trimis date greșite)
            return res.status(400).json({ error: error.message });
        }
        
        console.error('Server Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

const httpDeleteReport = (req, res) => {
    const idToDelete = parseInt(req.params.id, 10);
    console.log(`Controller: DELETE /api/reports/${idToDelete}`);
    
    try {
        reportService.deleteReport(idToDelete);
        res.status(200).json({ message: 'Report successfully deleted!' });
    } catch (error) {
        if (error.message === 'Report not found') {
            return res.status(404).json({ error: 'Report not found!' });
        }
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = {
    httpGetAllReports,
    httpAddNewReport,
    httpDeleteReport
};