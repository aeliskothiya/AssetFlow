const asyncHandler = require('../middleware/asyncHandler');
const { listUsers } = require('../services/userService');

const list = asyncHandler(async (req, res) => {
  const result = await listUsers({
    page: req.query.page,
    limit: req.query.limit,
    search: req.query.search,
    role: req.query.role,
    department: req.query.department,
  });

  res.status(200).json({
    success: true,
    data: result.items,
    pagination: result.pagination,
  });
});

module.exports = {
  list,
};
