let reports = [
    {
        id: 1,
        name: "Gropă mare pe Calea Moților",
        date: "2025-10-20T10:00:00Z",
        location: { lat: 46.7685, lng: 23.5862 }, 
        category: "POTHOLE",
        status: "REPORTED", 
        severity_level: "HIGH" 
    },
    {
        id: 2,
        name: "Gunoi neridicat în Mărăști",
        date: "2025-10-19T14:30:00Z",
        location: { lat: 46.7788, lng: 23.6120 },
        category: "WASTE",
        status: "REPORTED",
        severity_level: "MEDIUM"
    }
];
let nextId = 3;

// Copy of the reports
const findAll = (filters = {}) => {
    const { category, status, severity } = filters;

    let filteredReports = [...reports]; 

    if (category) {
        filteredReports = filteredReports.filter(report => report.category === category);
    }

    if (status) {
        filteredReports = filteredReports.filter(report => report.status === status);
    }

    if (severity) {
        filteredReports = filteredReports.filter(report => report.severity_level === severity);
    }
    
    return filteredReports; 
};

const findById = (id) => {
    return reports.find(report => report.id === id);
};

const create = (reportModel) => {
    reportModel.id = nextId++;
    reportModel.date = new Date().toISOString();
    
    reports.push(reportModel);
    return reportModel;
};

const deleteById = (id) => {
    const reportIndex = reports.findIndex(report => report.id === id);
    if (reportIndex === -1) {
        return false;
    }
    reports.splice(reportIndex, 1);
    return true; 
};

// Export so that they can be used by service
module.exports = {
    findAll,
    findById,
    create,
    deleteById
};