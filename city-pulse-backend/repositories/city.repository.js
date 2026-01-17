const pool = require('../database/db.config');

// Get all cities
const getAllCities = async () => {
    const query = 'SELECT id, name, lat, lng FROM cities ORDER BY name ASC';
    const result = await pool.query(query);
    return result.rows;
};

module.exports = {
    getAllCities
};