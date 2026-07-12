const AssetCategory = require('../models/AssetCategory');
const ApiError = require('../utils/ApiError');

const createCategory = async (payload) => {
  const name = payload.name.trim();
  const existing = await AssetCategory.findOne({ name });
  if (existing) {
    throw new ApiError(409, 'Asset category already exists');
  }

  return AssetCategory.create({
    ...payload,
    name,
    description: payload.description?.trim() || '',
    icon: payload.icon?.trim() || '',
  });
};

const listCategories = async ({ page, limit, search, includeInactive }) => {
  const query = {};
  if (includeInactive !== true) {
    query.isActive = true;
  }
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    AssetCategory.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
    AssetCategory.countDocuments(query),
  ]);

  return { items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 } };
};

const getCategory = async (categoryId, includeInactive = false) => {
  const query = { _id: categoryId };
  if (!includeInactive) query.isActive = true;
  const category = await AssetCategory.findOne(query);
  if (!category) throw new ApiError(404, 'Asset category not found');
  return category;
};

const updateCategory = async (categoryId, payload) => {
  const category = await AssetCategory.findById(categoryId);
  if (!category) throw new ApiError(404, 'Asset category not found');

  if (payload.name) {
    const duplicate = await AssetCategory.findOne({ _id: { $ne: categoryId }, name: payload.name.trim() });
    if (duplicate) throw new ApiError(409, 'Asset category already exists');
  }

  Object.assign(category, {
    ...payload,
    name: payload.name?.trim() ?? category.name,
    description: payload.description?.trim() ?? category.description,
    icon: payload.icon?.trim() ?? category.icon,
  });

  await category.save();
  return category;
};

const deactivateCategory = async (categoryId) => {
  const category = await AssetCategory.findById(categoryId);
  if (!category) throw new ApiError(404, 'Asset category not found');
  category.isActive = false;
  await category.save();
  return category;
};

module.exports = { createCategory, listCategories, getCategory, updateCategory, deactivateCategory };
