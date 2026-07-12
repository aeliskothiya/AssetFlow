const asyncHandler = require('../middleware/asyncHandler');
const {
  createCategory,
  listCategories,
  getCategory,
  updateCategory,
  deactivateCategory,
} = require('../services/assetCategoryService');

const create = asyncHandler(async (req, res) => {
  const category = await createCategory(req.body);
  res.status(201).json({ success: true, message: 'Asset category created successfully', data: category });
});

const list = asyncHandler(async (req, res) => {
  const result = await listCategories({
    page: req.query.page,
    limit: req.query.limit,
    search: req.query.search,
    includeInactive: req.query.includeInactive === 'true',
  });
  res.status(200).json({ success: true, data: result.items, pagination: result.pagination });
});

const details = asyncHandler(async (req, res) => {
  const category = await getCategory(req.params.categoryId, req.query.includeInactive === 'true');
  res.status(200).json({ success: true, data: category });
});

const update = asyncHandler(async (req, res) => {
  const category = await updateCategory(req.params.categoryId, req.body);
  res.status(200).json({ success: true, message: 'Asset category updated successfully', data: category });
});

const remove = asyncHandler(async (req, res) => {
  const category = await deactivateCategory(req.params.categoryId);
  res.status(200).json({ success: true, message: 'Asset category deactivated successfully', data: category });
});

module.exports = { create, list, details, update, remove };
