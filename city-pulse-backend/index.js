// set-up

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// In-memory temporary reports
// !!! images + upvotes will be added later

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

// temp next id 
let nextId = 3;

// constant ENUMS
const CATEGORIES = ["POTHOLE", "WASTE", "POLLUTION", "PUBLIC_LIGHTING", "OTHER"];
const STATUSES = ["REPORTED", "WORKING", "DONE", "PLANNING"];
const SEVERITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

// Get reports
app.get('/api/reports', (req, res) => {
    console.log('GET /api/reports - All reports requested!');
    res.status(200).json(reports);
});

// Add report
app.post('/api/reports', (req, res) => {
    const { name, location, category, severity_level } = req.body;

    // Simple validation
    if (!name || !location || !location.lat || !location.lng || !category || !severity_level) {
        return res.status(400).json({ error: 'All fields are required: name, location (lat and lng), category, severity_level' });
    }

    // Creating new report object
    const newReport = {
        id: nextId++, 
        name: name,
        date: new Date().toISOString(), // current date
        location: location,
        category: category,
        status: "REPORTED", // default status
        severity_level: severity_level
    };

    reports.push(newReport);

    console.log('POST /api/reports - New report added:', newReport);

    res.status(201).json(newReport);
});

// Delete report
app.delete('/api/reports/:id', (req, res) => {
    const idToDelete = parseInt(req.params.id, 10);
    const reportIndex = reports.findIndex(report => report.id === idToDelete);
    if (reportIndex === -1) {
        console.log(`DELETE /api/reports/${idToDelete} - Error: not found!`);
        return res.status(404).json({ error: 'Report not found!' });
    }
    reports.splice(reportIndex, 1);
    console.log(`DELETE /api/reports/${idToDelete} - Deleted successfully!`);
    res.status(200).json({ message: 'Report successfully deleted!' });
});

app.listen(PORT, () => {
    console.log(`CityPulse Server listening on port ${PORT}`);
});