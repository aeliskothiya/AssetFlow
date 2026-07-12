const asyncHandler = require('../middleware/asyncHandler');
const { getDashboardOverview } = require('../services/dashboardService');

const overview = asyncHandler(async (_req, res) => {
  const data = await getDashboardOverview();
  res.status(200).json({ success: true, data });
});

module.exports = { overview };
