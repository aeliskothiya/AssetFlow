const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('./asyncHandler');

const extractToken = (req) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.split(' ')[1];
  }

  return null;
};

const protect = asyncHandler(async (req, _res, next) => {
  const token = extractToken(req);

  if (!token) {
    throw new ApiError(401, 'Not authorized, token missing');
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw new ApiError(401, 'Not authorized, token invalid');
  }

  const user = await User.findById(decoded.id).select('+password');
  if (!user || !user.isActive) {
    throw new ApiError(401, 'Not authorized, user not found');
  }

  req.user = user;
  next();
});

const restrictTo = (...allowedRoles) =>
  asyncHandler(async (req, _res, next) => {
    if (!req.user) {
      throw new ApiError(401, 'Not authorized');
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new ApiError(403, 'Forbidden: insufficient permissions');
    }

    next();
  });

module.exports = {
  protect,
  restrictTo,
};
