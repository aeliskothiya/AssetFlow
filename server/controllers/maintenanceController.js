const asyncHandler = require('../middleware/asyncHandler');
const { createMaintenance, listMaintenance, getMaintenance, updateMaintenance } = require('../services/maintenanceService');

const create = asyncHandler(async (req, res) => {
  const maintenance = await createMaintenance(req.body, req.user);
  res.status(201).json({ success: true, message: 'Maintenance request created successfully', data: maintenance });
});

const list = asyncHandler(async (req, res) => {
  const result = await listMaintenance({
    page: req.query.page,
    limit: req.query.limit,
    search: req.query.search,
    status: req.query.status,
    user: req.user,
  });
  res.status(200).json({ success: true, data: result.items, pagination: result.pagination });
});

const details = asyncHandler(async (req, res) => {
  const maintenance = await getMaintenance(req.params.maintenanceId);
  res.status(200).json({ success: true, data: maintenance });
});

const update = asyncHandler(async (req, res) => {
  const maintenance = await updateMaintenance(req.params.maintenanceId, req.body, req.user);
  res.status(200).json({ success: true, message: 'Maintenance updated successfully', data: maintenance });
});

module.exports = { create, list, details, update };
