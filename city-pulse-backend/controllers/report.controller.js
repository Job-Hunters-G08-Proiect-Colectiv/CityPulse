const reportService = require('../services/report.service');

const httpGetAllReports = async (req, res) => {
    try {
        const filters = {
            category: req.query.category,
            status: req.query.status,
            // backend repository expects `severity`, not `severityLevel`
            severity: req.query.severityLevel,
            search: req.query.search,
            cityId: req.query.cityId ? Number(req.query.cityId) : undefined,
        };
        const reports = await reportService.getAllReports(filters);
        res.status(200).json(reports);
    } catch (error) {
        console.error('Error getting reports:', error);
        res.status(500).json({ error: 'Failed to fetch reports' });
    }
};

const httpGetReportById = async (req, res) => {
    try {
        const report = await reportService.getReportById(req.params.id);
        if (!report) {
            return res.status(404).json({ error: 'Report not found' });
        }
        res.status(200).json(report);
    } catch (error) {
        console.error('Error getting report:', error);
        res.status(500).json({ error: 'Failed to fetch report' });
    }
};

const httpCreateReport = async (req, res) => {
    try {
        // Get user ID from the authenticated token (added by authenticateToken middleware)
        const userId = req.user.id;
        
        // Use addNewReport instead of createReport
        const newReport = await reportService.addNewReport(req.body, userId);
        res.status(201).json(newReport);
    } catch (error) {
        console.error('Error creating report:', error);
        res.status(400).json({ error: error.message || 'Failed to create report' });
    }
};

const httpUpdateReport = async (req, res) => {
    try {
        const updatedReport = await reportService.updateReport(req.params.id, req.body);
        if (!updatedReport) {
            return res.status(404).json({ error: 'Report not found' });
        }
        res.status(200).json(updatedReport);
    } catch (error) {
        console.error('Error updating report:', error);
        res.status(400).json({ error: error.message || 'Failed to update report' });
    }
};

const httpDeleteReport = async (req, res) => {
    try {
        const result = await reportService.deleteReport(req.params.id);
        if (!result) {
            return res.status(404).json({ error: 'Report not found' });
        }
        res.status(200).json({ message: 'Report deleted successfully' });
    } catch (error) {
        console.error('Error deleting report:', error);
        res.status(500).json({ error: 'Failed to delete report' });
    }
};

module.exports = {
    httpGetAllReports,
    httpGetReportById,
    httpCreateReport,
    httpUpdateReport,
    httpDeleteReport
};