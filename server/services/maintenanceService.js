const mongoose = require('mongoose');
const Maintenance = require('../models/Maintenance');
const Asset = require('../models/Asset');
const Department = require('../models/Department');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');

const populateMaintenance = [
  { path: 'asset', populate: [{ path: 'category' }, { path: 'department' }] },
  { path: 'requestedBy', select: 'name email role' },
  { path: 'department' },
  { path: 'technician', select: 'name email role' },
  { path: 'assignedBy', select: 'name email role' },
];

const refreshAssetMaintenanceStatus = async (assetId) => {
  const activeMaintenance = await Maintenance.exists({
    asset: assetId,
    status: { $in: ['Approved', 'Technician Assigned', 'In Progress'] },
  });
  const asset = await Asset.findById(assetId);
  if (asset) {
    asset.status = activeMaintenance ? 'Under Maintenance' : 'Available';
    await asset.save();
  }
};

const createMaintenance = async (payload, user) => {
  if (!mongoose.Types.ObjectId.isValid(payload.asset)) throw new ApiError(400, 'Invalid asset id');
  if (payload.department && !mongoose.Types.ObjectId.isValid(payload.department)) throw new ApiError(400, 'Invalid department id');

  const asset = await Asset.findById(payload.asset);
  if (!asset) throw new ApiError(404, 'Asset not found');
  if (['Retired', 'Disposed', 'Lost'].includes(asset.status)) throw new ApiError(400, 'Asset is not eligible for maintenance');

  if (payload.department) {
    const department = await Department.findById(payload.department);
    if (!department || !department.isActive) throw new ApiError(404, 'Department not found');
  }

  const maintenance = await Maintenance.create({
    asset: asset._id,
    requestedBy: user.id,
    department: payload.department || asset.department || null,
    issueDescription: payload.issueDescription.trim(),
    priority: payload.priority || 'Medium',
    scheduledAt: payload.scheduledAt ? new Date(payload.scheduledAt) : null,
  });

  await maintenance.populate(populateMaintenance);
  return maintenance;
};

const listMaintenance = async ({ page, limit, _search, status, user }) => {
  const query = {};
  if (status) query.status = status;
  if (!['Admin', 'Asset Manager', 'Department Head'].includes(user.role)) query.requestedBy = user.id;
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    Maintenance.find(query).populate(populateMaintenance).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Maintenance.countDocuments(query),
  ]);
  return { items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 } };
};

const getMaintenance = async (maintenanceId) => {
  const maintenance = await Maintenance.findById(maintenanceId).populate(populateMaintenance);
  if (!maintenance) throw new ApiError(404, 'Maintenance not found');
  return maintenance;
};

const updateMaintenance = async (maintenanceId, payload, user) => {
  const maintenance = await Maintenance.findById(maintenanceId);
  if (!maintenance) throw new ApiError(404, 'Maintenance not found');

  if (!['Admin', 'Asset Manager', 'Department Head'].includes(user.role) && maintenance.requestedBy.toString() !== user.id) {
    throw new ApiError(403, 'Forbidden: insufficient permissions');
  }

  if (payload.technician) {
    if (!mongoose.Types.ObjectId.isValid(payload.technician)) throw new ApiError(400, 'Invalid technician id');
    const technician = await User.findById(payload.technician);
    if (!technician || !technician.isActive) throw new ApiError(404, 'Technician user not found');
    maintenance.technician = technician._id;
  }

  if (payload.status) maintenance.status = payload.status;
  if (payload.assignedBy) maintenance.assignedBy = payload.assignedBy;
  if (payload.resolutionNotes !== undefined) maintenance.resolutionNotes = payload.resolutionNotes.trim();
  if (payload.scheduledAt !== undefined) maintenance.scheduledAt = payload.scheduledAt ? new Date(payload.scheduledAt) : null;

  if (maintenance.status === 'Approved' || maintenance.status === 'Technician Assigned' || maintenance.status === 'In Progress') {
    maintenance.startedAt = maintenance.startedAt || new Date();
  }
  if (maintenance.status === 'Resolved') {
    maintenance.resolvedAt = new Date();
  }

  await maintenance.save();
  await refreshAssetMaintenanceStatus(maintenance.asset);
  await maintenance.populate(populateMaintenance);
  return maintenance;
};

module.exports = { createMaintenance, listMaintenance, getMaintenance, updateMaintenance };
