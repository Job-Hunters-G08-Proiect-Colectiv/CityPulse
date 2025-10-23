let reports = [
    {
        id: 1,
        name: "Gropă mare pe Calea Moților",
        date: "2025-10-20T10:00:00Z",
        location: { lat: 46.7685, lng: 23.5862 }, 
        address: "Calea Moților, nr. 5, Cluj-Napoca",
        images: [],
        category: "POTHOLE",
        status: "PENDING", 
        severityLevel: "HIGH",
        upvotes: 12,
        description: "Gropă periculoasă care afectează traficul"
    },
    {
        id: 2,
        name: "Gunoi neridicat în Mărăști",
        date: "2025-10-19T14:30:00Z",
        location: { lat: 46.7788, lng: 23.6120 },
        address: "Piața Mărăști, vis-a-vis de Lidl",
        images: [],
        category: "WASTE",
        status: "PENDING",
        severityLevel: "MEDIUM",
        upvotes: 8,
        description: "Gunoiul se acumulează de câteva zile"
    }
];
let nextId = 3;

// Copy of the reports
const findAll = (filters = {}) => {
    const { category, status, severity, search } = filters;

    let filteredReports = [...reports]; 

    if (category) {
        filteredReports = filteredReports.filter(report => report.category === category);
    }

    if (status) {
        filteredReports = filteredReports.filter(report => report.status === status);
    }

    if (severity) {
        filteredReports = filteredReports.filter(report => report.severityLevel === severity);
    }

    // search functionality
    if (search) {
        const searchLower = search.toLowerCase();
        filteredReports = filteredReports.filter(report => 
            report.name.toLowerCase().includes(searchLower) ||
            report.address.toLowerCase().includes(searchLower) ||
            (report.description && report.description.toLowerCase().includes(searchLower))
        );
    }
    
    return filteredReports; 
};

const findById = (id) => {
    return reports.find(report => report.id === id);
};

const updateById = (id, dataToUpdate) => {
    const reportIndex = reports.findIndex(report => report.id === id);
    if (reportIndex === -1) {
        return null;
    }

    // keeping original report to allow partial updates
    const originalReport = reports[reportIndex];
    const updatedReport = { 
        ...originalReport, 
        ...dataToUpdate    
    };

    reports[reportIndex] = updatedReport;
    return updatedReport;
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
    deleteById,
    updateById
};