const mongoose = require('mongoose');
const Allocation = require('../models/Allocation');
const Asset = require('../models/Asset');
const User = require('../models/User');
const Department = require('../models/Department');
const ApiError = require('../utils/ApiError');

const populateAllocation = [
  { path: 'asset', populate: [{ path: 'category' }, { path: 'department' }] },
  { path: 'allocatedTo', select: 'name email role' },
  { path: 'allocatedBy', select: 'name email role' },
  { path: 'department' },
];

const createAllocation = async (payload, userId) => {
  if (!mongoose.Types.ObjectId.isValid(payload.asset)) throw new ApiError(400, 'Invalid asset id');
  if (!mongoose.Types.ObjectId.isValid(payload.allocatedTo)) throw new ApiError(400, 'Invalid user id');
  if (payload.department && !mongoose.Types.ObjectId.isValid(payload.department)) throw new ApiError(400, 'Invalid department id');

  const asset = await Asset.findById(payload.asset);
  if (!asset) throw new ApiError(404, 'Asset not found');
  if (asset.status !== 'Available') throw new ApiError(400, 'Asset is not available for allocation');

  const allocatedTo = await User.findById(payload.allocatedTo);
  if (!allocatedTo || !allocatedTo.isActive) throw new ApiError(404, 'Allocated user not found');

  if (payload.department) {
    const department = await Department.findById(payload.department);
    if (!department || !department.isActive) throw new ApiError(404, 'Department not found');
  }

  const existingActive = await Allocation.findOne({ asset: asset._id, status: 'Active' });
  if (existingActive) throw new ApiError(400, 'Asset already has an active allocation');

  asset.status = 'Allocated';
  await asset.save();

  const allocation = await Allocation.create({
    asset: asset._id,
    allocatedTo: allocatedTo._id,
    department: payload.department || asset.department || null,
    allocatedBy: userId,
    purpose: payload.purpose?.trim() || '',
    notes: payload.notes?.trim() || '',
  });

  await allocation.populate(populateAllocation);
  return allocation;
};

const listAllocations = async ({ page, limit, search, status }) => {
  const query = {};
  if (status) query.status = status;
  if (search) {
    query.$or = [];
  }
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    Allocation.find(query).populate(populateAllocation).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Allocation.countDocuments(query),
  ]);
  return { items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 } };
};

const getAllocation = async (allocationId) => {
  const allocation = await Allocation.findById(allocationId).populate(populateAllocation);
  if (!allocation) throw new ApiError(404, 'Allocation not found');
  return allocation;
};

const returnAllocation = async (allocationId, returnNotes) => {
  const allocation = await Allocation.findById(allocationId);
  if (!allocation) throw new ApiError(404, 'Allocation not found');
  if (allocation.status !== 'Active') throw new ApiError(400, 'Allocation is not active');

  allocation.status = 'Returned';
  allocation.returnedAt = new Date();
  allocation.returnNotes = returnNotes?.trim() || '';
  await allocation.save();

  const asset = await Asset.findById(allocation.asset);
  if (asset) {
    asset.status = 'Available';
    await asset.save();
  }

  await allocation.populate(populateAllocation);
  return allocation;
};

module.exports = { createAllocation, listAllocations, getAllocation, returnAllocation };
