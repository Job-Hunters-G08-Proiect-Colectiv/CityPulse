// express app (exported for testing)

const express = require('express');
const cors = require('cors');
const reportRoutes = require('./routes/report.routes');

const app = express();

app.use(cors({
    // Allow requests from any origin in development; tighten for production as needed
    origin: true,
    credentials: true
}));
app.use(express.json());

// Lightweight health endpoint used by frontend connectivity checks
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

app.use('/api/reports', reportRoutes);

module.exports = app;


