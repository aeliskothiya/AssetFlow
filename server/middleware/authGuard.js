const { restrictTo } = require('./authMiddleware');

const authGuard = (...roles) => {
  return restrictTo(...roles);
};

module.exports = authGuard;
