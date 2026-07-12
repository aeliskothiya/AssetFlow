const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const generateToken = require('../utils/generateToken');

const buildAuthResponse = (user) => ({
  user: user.toSafeObject(),
  token: generateToken({ id: user._id.toString(), role: user.role }),
});

const registerEmployee = async ({ name, email, password }) => {
  const normalizedEmail = email.trim().toLowerCase();
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    throw new ApiError(409, 'A user with this email already exists');
  }

  const user = await User.create({
    name,
    email: normalizedEmail,
    password,
    role: 'Employee',
  });

  return buildAuthResponse(user);
};

const loginUser = async ({ email, password }) => {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail }).select('+password');
  if (!user || !user.isActive) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid email or password');
  }

  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  return buildAuthResponse(user);
};

const getProfile = async (userId) => {
  const user = await User.findById(userId).populate('department');
  if (!user || !user.isActive) {
    throw new ApiError(404, 'User not found');
  }

  return user.toSafeObject();
};

const promoteUserRole = async ({ userId, role }) => {
  const user = await User.findById(userId);
  if (!user || !user.isActive) {
    throw new ApiError(404, 'User not found');
  }

  user.role = role;
  await user.save();

  return user.toSafeObject();
};

module.exports = {
  registerEmployee,
  loginUser,
  getProfile,
  promoteUserRole,
};
