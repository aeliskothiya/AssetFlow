const mongoose = require('mongoose');
const Department = require('../models/Department');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');

const departmentPopulate = {
  path: 'manager',
  select: 'name email role',
};

const normalizeDepartmentPayload = async (payload) => {
  const normalized = { ...payload };

  if (typeof normalized.name === 'string') {
    normalized.name = normalized.name.trim();
  }

  if (typeof normalized.code === 'string') {
    normalized.code = normalized.code.trim().toUpperCase();
  }

  if (typeof normalized.description === 'string') {
    normalized.description = normalized.description.trim();
  }

  if (normalized.manager === null || normalized.manager === '') {
    normalized.manager = null;
  }

  if (normalized.manager) {
    if (!mongoose.Types.ObjectId.isValid(normalized.manager)) {
      throw new ApiError(400, 'Invalid manager id');
    }

    const manager = await User.findById(normalized.manager);
    if (!manager || !manager.isActive) {
      throw new ApiError(404, 'Manager user not found');
    }
  }

  return normalized;
};

const createDepartment = async (payload) => {
  const data = await normalizeDepartmentPayload(payload);

  const existingDepartment = await Department.findOne({
    $or: [{ name: data.name }, { code: data.code }],
  });

  if (existingDepartment) {
    throw new ApiError(409, 'Department name or code already exists');
  }

  const department = await Department.create(data);
  return department.populate(departmentPopulate);
};

const listDepartments = async ({ page, limit, search, includeInactive, userRole }) => {
  const query = {};
  const canSeeInactive = ['Admin', 'Asset Manager'].includes(userRole);

  if (!includeInactive || !canSeeInactive) {
    query.isActive = true;
  }

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { code: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    Department.find(query)
      .populate(departmentPopulate)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Department.countDocuments(query),
  ]);

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
};

const getDepartmentById = async ({ departmentId, userRole, includeInactive = false }) => {
  const query = { _id: departmentId };
  const canSeeInactive = ['Admin', 'Asset Manager'].includes(userRole);

  if (!includeInactive || !canSeeInactive) {
    query.isActive = true;
  }

  const department = await Department.findOne(query).populate(departmentPopulate);
  if (!department) {
    throw new ApiError(404, 'Department not found');
  }

  return department;
};

const updateDepartment = async (departmentId, payload) => {
  const department = await Department.findById(departmentId);
  if (!department) {
    throw new ApiError(404, 'Department not found');
  }

  const data = await normalizeDepartmentPayload(payload);

  if (data.name || data.code) {
    const duplicate = await Department.findOne({
      _id: { $ne: departmentId },
      $or: [
        ...(data.name ? [{ name: data.name }] : []),
        ...(data.code ? [{ code: data.code }] : []),
      ],
    });

    if (duplicate) {
      throw new ApiError(409, 'Department name or code already exists');
    }
  }

  Object.assign(department, data);
  await department.save();
  await department.populate(departmentPopulate);

  return department;
};

const removeDepartment = async (departmentId) => {
  const department = await Department.findById(departmentId);
  if (!department) {
    throw new ApiError(404, 'Department not found');
  }

  department.isActive = false;
  await department.save();
  await department.populate(departmentPopulate);

  return department;
};

module.exports = {
  createDepartment,
  listDepartments,
  getDepartmentById,
  updateDepartment,
  removeDepartment,
};
