const mongoose = require('mongoose');
const TransferRequest = require('../models/TransferRequest');
const Asset = require('../models/Asset');
const ApiError = require('../utils/ApiError');

const populateTransfer = [
  { path: 'asset', select: 'assetTag name location' },
  { path: 'requestedBy', select: 'name email role' },
  { path: 'fromDepartment', select: 'name' },
  { path: 'toDepartment', select: 'name' },
  { path: 'approvedBy', select: 'name email' },
];

const createTransfer = async (payload, user) => {
  if (!mongoose.Types.ObjectId.isValid(payload.asset)) throw new ApiError(400, 'Invalid asset id');
  if (!mongoose.Types.ObjectId.isValid(payload.toDepartment)) throw new ApiError(400, 'Invalid target department id');

  const asset = await Asset.findById(payload.asset);
  if (!asset) throw new ApiError(404, 'Asset not found');

  if (asset.department?.toString() === payload.toDepartment) {
    throw new ApiError(400, 'Asset is already in the target department');
  }

  const existingPending = await TransferRequest.findOne({ asset: asset._id, status: 'Requested' });
  if (existingPending) {
    throw new ApiError(400, 'A pending transfer request already exists for this asset');
  }

  const transfer = await TransferRequest.create({
    asset: asset._id,
    requestedBy: user.id,
    fromDepartment: asset.department || null,
    toDepartment: payload.toDepartment,
    reason: payload.reason?.trim() || '',
    priority: payload.priority || 'Medium',
    status: 'Requested',
  });

  await transfer.populate(populateTransfer);
  return transfer;
};

const listTransfers = async ({ page, limit, status, user }) => {
  const query = {};
  if (status) query.status = status;
  
  if (user.role === 'Department Head' && user.department) {
    query.$or = [
      { fromDepartment: user.department },
      { toDepartment: user.department },
      { requestedBy: user.id }
    ];
  } else if (!['Admin', 'Asset Manager'].includes(user.role)) {
    query.requestedBy = user.id;
  }

  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    TransferRequest.find(query).populate(populateTransfer).sort({ createdAt: -1 }).skip(skip).limit(limit),
    TransferRequest.countDocuments(query),
  ]);

  return { items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 } };
};

const getTransfer = async (transferId) => {
  const transfer = await TransferRequest.findById(transferId).populate(populateTransfer);
  if (!transfer) throw new ApiError(404, 'Transfer request not found');
  return transfer;
};

const updateTransferStatus = async (transferId, status, comments, user) => {
  const transfer = await TransferRequest.findById(transferId);
  if (!transfer) throw new ApiError(404, 'Transfer request not found');

  if (['Approved', 'Rejected', 'Completed', 'Cancelled'].includes(transfer.status) && transfer.status !== 'Approved') {
    throw new ApiError(400, `Cannot update a transfer request that is already ${transfer.status}`);
  }
  
  if (status === 'Approved' || status === 'Rejected') {
    if (!['Admin', 'Asset Manager', 'Department Head'].includes(user.role)) {
      throw new ApiError(403, 'Forbidden: insufficient permissions');
    }
    transfer.approvedBy = user.id;
    transfer.approvalDate = new Date();
  } else if (status === 'Cancelled') {
    if (transfer.requestedBy.toString() !== user.id && !['Admin', 'Asset Manager', 'Department Head'].includes(user.role)) {
      throw new ApiError(403, 'Forbidden: insufficient permissions');
    }
  }

  if (status === 'Completed' && transfer.status === 'Approved') {
    const asset = await Asset.findById(transfer.asset);
    if (asset) {
      const Allocation = require('../models/Allocation');
      const activeAllocation = await Allocation.findOne({ asset: asset._id, status: 'Active' });
      if (activeAllocation) {
        activeAllocation.status = 'Returned';
        activeAllocation.returnedAt = new Date();
        activeAllocation.returnNotes = 'Automatically returned due to completed transfer.';
        await activeAllocation.save();
      }
      asset.department = transfer.toDepartment;
      asset.status = 'Available';
      await asset.save();
    }
  }

  transfer.status = status;
  if (comments) transfer.comments = comments.trim();
  
  await transfer.save();
  await transfer.populate(populateTransfer);
  return transfer;
};

module.exports = { createTransfer, listTransfers, getTransfer, updateTransferStatus };
