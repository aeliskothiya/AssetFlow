const asyncHandler = require('../middleware/asyncHandler');
const { getDashboardOverview } = require('../services/dashboardService');

const overview = asyncHandler(async (req, res) => {
  const data = await getDashboardOverview(req.user);
  res.status(200).json({ success: true, data });
});

module.exports = { overview };
