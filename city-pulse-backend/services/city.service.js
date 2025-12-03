const cityRepo = require('../repositories/city.repository');

const getAllCities = async () => {
    const cities = await cityRepo.getAllCities();
    return cities;
};

module.exports = {
    getAllCities
};