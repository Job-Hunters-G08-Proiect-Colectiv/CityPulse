const express = require("express");
const router = express.Router();
const statisticsController = require("../controllers/stats.controller");

// GET /api/statistics/overview
router.get("/overview", statisticsController.getOverview);

// GET /api/statistics/by-district/:cityId
router.get("/by-district/:cityId", statisticsController.getByDistrict);

// GET /api/statistics/by-category
router.get("/by-category", statisticsController.getByCategory);

// GET /api/statistics/by-severity
router.get("/by-severity", statisticsController.getBySeverity);

module.exports = router;
