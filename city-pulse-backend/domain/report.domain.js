// models/report.model.js

// Importăm ENUM-urile ca să le putem valida
const CATEGORIES = ["POTHOLE", "WASTE", "POLLUTION", "PUBLIC_LIGHTING", "OTHER"];
const SEVERITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

class Report {
    constructor(name, location, category, severity_level) {
        this.name = name;
        this.location = location;
        this.category = category;
        this.severity_level = severity_level;

        this.id = null;
        this.date = null;
        this.status = "REPORTED";
    }
}

module.exports = {
    Report,
    CATEGORIES,
    SEVERITIES
};