const cityService = require('../services/city.service');

const httpGetAllCities = async (req, res) => {
    try {
        const cities = await cityService.getAllCities();
        return res.status(200).json(cities);
    } catch (err) {
        console.error("Error fetching cities:", err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

// get by city id

module.exports = {
    httpGetAllCities
};