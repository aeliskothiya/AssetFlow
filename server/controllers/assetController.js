const asyncHandler = require('../middleware/asyncHandler');
const { createAsset, listAssets, getAsset, updateAsset, deleteAsset } = require('../services/assetService');

const create = asyncHandler(async (req, res) => {
  const asset = await createAsset(req.body, req.user.id);
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
  });
  res.status(200).json({ success: true, data: result.items, pagination: result.pagination });
});

const details = asyncHandler(async (req, res) => {
  const asset = await getAsset(req.params.assetId);
  res.status(200).json({ success: true, data: asset });
});

const update = asyncHandler(async (req, res) => {
  const asset = await updateAsset(req.params.assetId, req.body);
  res.status(200).json({ success: true, message: 'Asset updated successfully', data: asset });
});

const remove = asyncHandler(async (req, res) => {
  const asset = await deleteAsset(req.params.assetId);
  res.status(200).json({ success: true, message: 'Asset disposed successfully', data: asset });
});

module.exports = { create, list, details, update, remove };
