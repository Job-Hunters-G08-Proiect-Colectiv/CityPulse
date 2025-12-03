const express = require('express');
const router = express.Router();
const { httpGetAllCities } = require('../controllers/city.controller');

router.get('/', httpGetAllCities);

module.exports = router;