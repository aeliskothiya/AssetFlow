const User = require('../models/User');

const listUsers = async ({ page, limit, search, role, department }) => {
  const query = { isActive: true };

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  if (role) {
    query.role = role;
  }

  if (department) {
    query.department = department;
  }

  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    User.find(query).populate('department').sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(query),
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

module.exports = {
  listUsers,
};
