const reportService = require('../services/report.service');

const httpGetAllReports = async (req, res) => {
    const filters = req.query; 
    
    console.log('Controller: GET /api/reports with filters:', filters);
    
    try {
        const allReports = await reportService.getAllReports(filters); 
        res.status(200).json(allReports);
    } catch (error) {
        console.error('Error in httpGetAllReports:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

const httpGetReportById = async (req, res) => {
    const id = parseInt(req.params.id, 10);
    console.log(`Controller: GET /api/reports/${id}`);
    
    try {
        const report = await reportService.getReportById(id);
        res.status(200).json(report);
    } catch (error) {
        if (error.message === 'Report not found') {
            return res.status(404).json({ error: error.message });
        }
        console.error('Error in httpGetReportById:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

const httpUpdateReport = async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const dataToUpdate = req.body;
    console.log(`Controller: PUT /api/reports/${id}`);

    try {
        const updatedReport = await reportService.updateReport(id, dataToUpdate);
        res.status(200).json(updatedReport);
    } catch (error) {
        if (error.message.includes('Invalid')) {
            return res.status(400).json({ error: error.message });
        }
        if (error.message === 'Report not found') {
            return res.status(404).json({ error: error.message });
        }
        console.error('Error in httpUpdateReport:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

const httpAddNewReport = async (req, res) => {
    console.log('Controller: POST /api/reports');

    try {
        const newReport = await reportService.addNewReport(req.body);
        res.status(201).json(newReport);
    } catch (error) {
        if (error.message.includes('required') || error.message.includes('Invalid')) {
            console.log('Validation Error:', error.message);
            return res.status(400).json({ error: error.message });
        }
        
        console.error('Server Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

const httpDeleteReport = async (req, res) => {
    const idToDelete = parseInt(req.params.id, 10);
    console.log(`Controller: DELETE /api/reports/${idToDelete}`);
    
    try {
        await reportService.deleteReport(idToDelete);
        res.status(200).json({ message: 'Report successfully deleted!' });
    } catch (error) {
        if (error.message === 'Report not found') {
            return res.status(404).json({ error: 'Report not found!' });
        }
        console.error('Error in httpDeleteReport:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = {
    httpGetAllReports,
    httpAddNewReport,
    httpDeleteReport,
    httpGetReportById,
    httpUpdateReport
};