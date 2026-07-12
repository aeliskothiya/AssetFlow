const asyncHandler = require('../middleware/asyncHandler');
const { createMaintenance, listMaintenance, getMaintenance, updateMaintenance } = require('../services/maintenanceService');
const { recordLog, createNotification } = require('../services/activityService');

const create = asyncHandler(async (req, res) => {
  const maintenance = await createMaintenance(req.body, req.user);
  await recordLog(req.user.id, 'Maintenance Requested', { maintenanceId: maintenance._id, assetId: maintenance.asset });
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
  await recordLog(req.user.id, 'Maintenance Updated', { maintenanceId: maintenance._id, assetId: maintenance.asset });
  res.status(200).json({ success: true, message: 'Maintenance updated successfully', data: maintenance });
});

const approve = asyncHandler(async (req, res) => {
  const maintenance = await updateMaintenance(req.params.maintenanceId, { status: 'Approved' }, req.user);
  await recordLog(req.user.id, 'Maintenance Approved', { maintenanceId: maintenance._id, assetId: maintenance.asset });
  await createNotification(maintenance.requestedBy, 'Maintenance Approved', 'Your maintenance request has been approved.', '/maintenance');
  res.status(200).json({ success: true, message: 'Maintenance approved', data: maintenance });
});

const assign = asyncHandler(async (req, res) => {
  const maintenance = await updateMaintenance(req.params.maintenanceId, { status: 'Technician Assigned', technician: req.body.technician, assignedBy: req.user.id }, req.user);
  await recordLog(req.user.id, 'Technician Assigned', { maintenanceId: maintenance._id, assetId: maintenance.asset });
  await createNotification(maintenance.requestedBy, 'Technician Assigned', 'A technician has been assigned to your maintenance request.', '/maintenance');
  res.status(200).json({ success: true, message: 'Technician assigned', data: maintenance });
});

const progress = asyncHandler(async (req, res) => {
  const maintenance = await updateMaintenance(req.params.maintenanceId, { status: 'In Progress' }, req.user);
  await recordLog(req.user.id, 'Maintenance In Progress', { maintenanceId: maintenance._id, assetId: maintenance.asset });
  res.status(200).json({ success: true, message: 'Maintenance in progress', data: maintenance });
});

const resolve = asyncHandler(async (req, res) => {
  const maintenance = await updateMaintenance(req.params.maintenanceId, { status: 'Resolved', resolutionNotes: req.body.resolutionNotes }, req.user);
  await recordLog(req.user.id, 'Maintenance Resolved', { maintenanceId: maintenance._id, assetId: maintenance.asset });
  await createNotification(maintenance.requestedBy, 'Maintenance Resolved', 'Your maintenance request has been resolved.', '/maintenance');
  res.status(200).json({ success: true, message: 'Maintenance resolved', data: maintenance });
});

module.exports = { create, list, details, update, approve, assign, progress, resolve };
