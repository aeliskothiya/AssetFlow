const asyncHandler = require('../middleware/asyncHandler');
const {
  departmentReport,
  assetReport,
  maintenanceReport,
  auditReport,
  bookingReport,
  exportCsv,
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

const exportData = asyncHandler(async (req, res) => {
  const { type } = req.query;
  let data;
  let fields;
  
  if (type === 'department') {
    data = await departmentReport();
    fields = ['department', 'code', 'totalAssets', 'allocatedAssets', 'totalBookings', 'totalMaintenance'];
  } else {
    res.status(400);
    throw new Error('Invalid export type');
  }

  const csv = exportCsv(data, fields);
  res.header('Content-Type', 'text/csv');
  res.attachment(`${type}-report.csv`);
  res.send(csv);
});

module.exports = {
  department,
  assets,
  maintenance,
  audit,
  bookings,
  exportData,
};
