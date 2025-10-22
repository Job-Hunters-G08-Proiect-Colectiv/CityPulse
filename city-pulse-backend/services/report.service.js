const reportRepository = require('../repositories/report.repository');
const { Report, CATEGORIES, SEVERITIES, STATUSES } = require('../domain/report.domain');

const getAllReports = (filters = {}) => {
    return reportRepository.findAll(filters);
};

const getReportById = (id) => {
    const report = reportRepository.findById(id);

    if (!report) {
        throw new Error('Report not found');
    }
    return report;
};

const updateReport = (id, dataToUpdate) => {
    console.log(`Service: Actualizez sesizarea ${id}`);

    if (dataToUpdate.status && !STATUSES.includes(dataToUpdate.status)) {
        throw new Error(`Invalid status. Must be one of: ${STATUSES.join(', ')}`);
    }
    if (dataToUpdate.category && !CATEGORIES.includes(dataToUpdate.category)) {
        throw new Error(`Invalid category. Must be one of: ${CATEGORIES.join(', ')}`);
    }
    if (dataToUpdate.severity_level && !SEVERITIES.includes(dataToUpdate.severity_level)) {
        throw new Error(`Invalid severity level. Must be one of: ${SEVERITIES.join(', ')}`);
    }

    if (dataToUpdate.address !== undefined && dataToUpdate.address.trim() === "") {
        throw new Error('Address is required.');
    }
    if (dataToUpdate.images && !Array.isArray(dataToUpdate.images)) {
        throw new Error('Images variable must be an array!');
    }

    const updatedReport = reportRepository.updateById(id, dataToUpdate);

    if (!updatedReport) {
        throw new Error('Report not found');
    }
    return updatedReport;
};

const addNewReport = (reportData) => {
    console.log('Service: Adding and verifying new report');
    const { name, location, category, severity_level, address, images } = reportData;
    
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
    if (!address || address.trim() === "") {
        throw new Error('Address is a required field.');
    }
    if (images && !Array.isArray(images)) {
        throw new Error('Images variable should be an array!');
    }
    
    const reportModel = new Report(name, location, category, severity_level, address, images);

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
    deleteReport,
    getReportById,
    updateReport
};