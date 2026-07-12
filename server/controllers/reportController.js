const asyncHandler = require('../middleware/asyncHandler');
const {
  departmentReport,
  assetReport,
  maintenanceReport,
  auditReport,
  bookingReport,
} = require('../services/reportService');

const department = asyncHandler(async (_req, res) => {
  const data = await departmentReport();
  res.status(200).json({ success: true, data });
});

const assets = asyncHandler(async (_req, res) => {
  const data = await assetReport();
  res.status(200).json({ success: true, data });
});

const maintenance = asyncHandler(async (_req, res) => {
  const data = await maintenanceReport();
  res.status(200).json({ success: true, data });
});

const audit = asyncHandler(async (_req, res) => {
  const data = await auditReport();
  res.status(200).json({ success: true, data });
});

const bookings = asyncHandler(async (_req, res) => {
  const data = await bookingReport();
  res.status(200).json({ success: true, data });
});

module.exports = {
  department,
  assets,
  maintenance,
  audit,
  bookings,
};
