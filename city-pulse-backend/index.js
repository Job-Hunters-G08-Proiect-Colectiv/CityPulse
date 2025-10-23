// set-up

const express = require('express');
const cors = require('cors');
const reportRoutes = require('./routes/report.routes');

const app = express();
const PORT = 3000;

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());

app.use('/api/reports', reportRoutes);

app.listen(PORT, () => {
    console.log(`CityPulse Server listening on port ${PORT}`);
});