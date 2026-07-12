const mongoose = require('mongoose');
const Asset = require('../models/Asset');
const AssetCategory = require('../models/AssetCategory');
const Department = require('../models/Department');
const ApiError = require('../utils/ApiError');

const populateAsset = [
  { path: 'category' },
  { path: 'department' },
  { path: 'createdBy', select: 'name email role' },
];

const normalizeAssetInput = async (payload) => {
  const data = { ...payload };
  if (data.department === '') data.department = null;

  if (data.category && !mongoose.Types.ObjectId.isValid(data.category)) throw new ApiError(400, 'Invalid category id');
  if (data.department && !mongoose.Types.ObjectId.isValid(data.department)) throw new ApiError(400, 'Invalid department id');

  const category = await AssetCategory.findById(data.category);
  if (!category || !category.isActive) throw new ApiError(404, 'Asset category not found');

  if (data.department) {
    const department = await Department.findById(data.department);
    if (!department || !department.isActive) throw new ApiError(404, 'Department not found');
  }

  return data;
};

const createAsset = async (payload, userId) => {
  const data = await normalizeAssetInput(payload);
  const existing = await Asset.findOne({ serialNumber: data.serialNumber.trim() });
  if (existing) throw new ApiError(409, 'Asset with this serial number already exists');

  const asset = await Asset.create({
    ...data,
    name: data.name.trim(),
    serialNumber: data.serialNumber.trim(),
    purchaseDate: new Date(data.purchaseDate),
    createdBy: userId,
    status: data.status || 'Available',
    location: data.location?.trim() || '',
    notes: data.notes?.trim() || '',
  });

  await asset.populate(populateAsset);
  return asset;
};

const listAssets = async ({ page, limit, search, status, category, department, user }) => {
  const query = {};

  if (user?.role === 'Department Head') {
    query.department = user.department;
  } else if (user?.role === 'Employee') {
    const Allocation = require('../models/Allocation');
    const myAllocations = await Allocation.find({ allocatedTo: user._id, status: 'Active' });
    const myAssetIds = myAllocations.map(a => a.asset);
    
    query.$or = [
      { _id: { $in: myAssetIds } },
      { sharedBookable: true }
    ];
  }

  if (search) {
    query.$or = [
      { assetTag: { $regex: search, $options: 'i' } },
      { name: { $regex: search, $options: 'i' } },
      { serialNumber: { $regex: search, $options: 'i' } },
      { location: { $regex: search, $options: 'i' } },
    ];
  }
  if (status) query.status = status;
  if (category) query.category = category;
  if (department && user?.role !== 'Department Head') query.department = department;

  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    Asset.find(query).populate(populateAsset).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Asset.countDocuments(query),
  ]);

  return { items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 } };
};

const getAsset = async (assetId) => {
  const asset = await Asset.findById(assetId).populate(populateAsset);
  if (!asset) throw new ApiError(404, 'Asset not found');
  return asset;
};

const updateAsset = async (assetId, payload) => {
  const asset = await Asset.findById(assetId);
  if (!asset) throw new ApiError(404, 'Asset not found');

  const data = await normalizeAssetInput({ ...asset.toObject(), ...payload });
  if (data.serialNumber) {
    const duplicate = await Asset.findOne({ _id: { $ne: assetId }, serialNumber: data.serialNumber.trim() });
    if (duplicate) throw new ApiError(409, 'Asset with this serial number already exists');
  }

  Object.assign(asset, {
    ...payload,
    name: payload.name?.trim() ?? asset.name,
    serialNumber: payload.serialNumber?.trim() ?? asset.serialNumber,
    location: payload.location?.trim() ?? asset.location,
    notes: payload.notes?.trim() ?? asset.notes,
    purchaseDate: payload.purchaseDate ? new Date(payload.purchaseDate) : asset.purchaseDate,
  });

  if (payload.category) asset.category = payload.category;
  if (typeof payload.sharedBookable === 'boolean') asset.sharedBookable = payload.sharedBookable;
  if (payload.department !== undefined) asset.department = payload.department;
  if (payload.status) asset.status = payload.status;
  if (payload.condition) asset.condition = payload.condition;
  if (payload.images) asset.images = payload.images;
  if (payload.documents) asset.documents = payload.documents;
  if (payload.purchaseCost !== undefined) asset.purchaseCost = payload.purchaseCost;

  await asset.save();
  await asset.populate(populateAsset);
  return asset;
};

const deleteAsset = async (assetId) => {
  const asset = await Asset.findById(assetId);
  if (!asset) throw new ApiError(404, 'Asset not found');
  asset.status = 'Disposed';
  await asset.save();
  await asset.populate(populateAsset);
  return asset;
};

module.exports = { createAsset, listAssets, getAsset, updateAsset, deleteAsset };
