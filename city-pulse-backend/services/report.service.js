const reportRepository = require('../repositories/report.repository');
const { Report, CATEGORIES, SEVERITIES } = require('../domain/report.domain');

const getAllReports = () => {
    return reportRepository.findAll();
};

const addNewReport = (reportData) => {
    console.log('Service: Adding and verifying new report');
    const { name, location, category, severity_level } = reportData;
    
    if (!name || name.trim() === "") {
        throw new Error('New report name required.');
    }
    if (!location || !location.lat || !location.lng) {
        throw new Error('New report location required.');
    }
    if (!category || !CATEGORIES.includes(category)) {
        throw new Error(`Invalid category. Must be one of: ${CATEGORIES.join(', ')}`);
    }
    if (!severity_level || !SEVERITIES.includes(severity_level)) {
        throw new Error(`Severity level invalid. Must be one of: ${SEVERITIES.join(', ')}`);
    }
    
    const reportModel = new Report(name, location, category, severity_level);

    return reportRepository.create(reportModel);
};

const deleteReport = (id) => {
    console.log(`Service: Deleting report ${id}`);
    const success = reportRepository.deleteById(id);
    if (!success) {
        throw new Error('Report not found'); 
    }
    return success;
};

module.exports = {
    getAllReports,
    addNewReport,
    deleteReport
};