const asyncHandler = require('../middleware/asyncHandler');
const { createAsset, listAssets, getAsset, updateAsset, deleteAsset } = require('../services/assetService');
const { recordLog } = require('../services/activityService');

const parseMediaList = (value) => {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value !== 'string' || value.trim() === '') {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const buildUploadedImage = (file) => ({
  url: `/uploads/${file.filename}`,
  publicId: file.filename,
});

const create = asyncHandler(async (req, res) => {
  const payload = { ...req.body };
  if (req.file) {
    payload.images = [buildUploadedImage(req.file), ...parseMediaList(payload.images)];
  } else {
    payload.images = parseMediaList(payload.images);
  }
  payload.documents = parseMediaList(payload.documents);
  const asset = await createAsset(payload, req.user.id);
  await recordLog(req.user.id, 'Asset Registered', { assetId: asset._id });
  res.status(201).json({ success: true, message: 'Asset registered successfully', data: asset });
});

const list = asyncHandler(async (req, res) => {
  const result = await listAssets({
    page: req.query.page,
    limit: req.query.limit,
    search: req.query.search,
    status: req.query.status,
    category: req.query.category,
    department: req.query.department,
    user: req.user,
  });
  res.status(200).json({ success: true, data: result.items, pagination: result.pagination });
});

const details = asyncHandler(async (req, res) => {
  const asset = await getAsset(req.params.assetId);
  res.status(200).json({ success: true, data: asset });
});

const update = asyncHandler(async (req, res) => {
  const payload = { ...req.body };
  if (req.file) {
    payload.images = [buildUploadedImage(req.file), ...parseMediaList(payload.images)];
  } else {
    payload.images = parseMediaList(payload.images);
  }
  payload.documents = parseMediaList(payload.documents);
  const asset = await updateAsset(req.params.assetId, payload);
  await recordLog(req.user.id, 'Asset Updated', { assetId: asset._id });
  res.status(200).json({ success: true, message: 'Asset updated successfully', data: asset });
});

const remove = asyncHandler(async (req, res) => {
  const asset = await deleteAsset(req.params.assetId);
  await recordLog(req.user.id, 'Asset Disposed', { assetId: asset._id });
  res.status(200).json({ success: true, message: 'Asset disposed successfully', data: asset });
});

module.exports = { create, list, details, update, remove };
