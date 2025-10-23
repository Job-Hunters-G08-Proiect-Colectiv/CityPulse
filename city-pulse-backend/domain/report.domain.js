const CATEGORIES = ["POTHOLE", "WASTE", "POLLUTION", "LIGHTING", "VANDALISM", "OTHER"];
const SEVERITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
const STATUSES = ["PENDING", "WORKING", "PLANNING", "DONE"];

class Report {
    constructor(name, location, category, severityLevel, address, images, description) {
        this.name = name;
        this.location = location;
        this.category = category;
        this.severityLevel = severityLevel;
        this.address = address;
        this.images = images || [];
        this.description = description || "";

        this.id = null;
        this.date = null;
        this.status = "PENDING";
        this.upvotes = 0;
    }
}

module.exports = {
    Report,
    CATEGORIES,
    SEVERITIES,
    STATUSES
};