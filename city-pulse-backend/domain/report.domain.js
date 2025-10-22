const CATEGORIES = ["POTHOLE", "WASTE", "POLLUTION", "PUBLIC_LIGHTING", "OTHER"];
const SEVERITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
const STATUSES = ["REPORTED", "WORKING", "DONE", "PLANNING"];

class Report {
    constructor(name, location, category, severity_level, address, images) {
        this.name = name;
        this.location = location;
        this.category = category;
        this.severity_level = severity_level;
        this.address = address;
        this.images = images || [];

        this.id = null;
        this.date = null;
        this.status = "REPORTED";
    }
}

module.exports = {
    Report,
    CATEGORIES,
    SEVERITIES,
    STATUSES
};