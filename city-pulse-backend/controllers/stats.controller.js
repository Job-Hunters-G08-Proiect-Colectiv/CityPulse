const statisticsService = require("../services/stats.service");

exports.getOverview = async (req, res) => {
  try {
    const cityId = req.query.cityId ? Number(req.query.cityId) : undefined;
    const data = await statisticsService.getOverview(cityId);
    res.json({ success: true, data });
  } catch (error) {
    console.error("Error fetching overview stats:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getByDistrict = async (req, res) => {
  const { cityId } = req.params;

  try {
    const data = await statisticsService.getByDistrict(cityId);
    res.json({ success: true, data });
  } catch (error) {
    console.error("Error fetching district stats:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getByCategory = async (req, res) => {
  try {
    const cityId = req.query.cityId ? Number(req.query.cityId) : undefined;
    const data = await statisticsService.getByCategory(cityId);
    res.json({ success: true, data });
  } catch (error) {
    console.error("Error fetching category stats:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getBySeverity = async (req, res) => {
  try {
    const cityId = req.query.cityId ? Number(req.query.cityId) : undefined;
    const data = await statisticsService.getBySeverity(cityId);
    res.json({ success: true, data });
  } catch (error) {
    console.error("Error fetching severity stats:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
