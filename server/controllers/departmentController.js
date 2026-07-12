const asyncHandler = require('../middleware/asyncHandler');
const {
  createDepartment,
  listDepartments,
  getDepartmentById,
  updateDepartment,
  removeDepartment,
} = require('../services/departmentService');

const create = asyncHandler(async (req, res) => {
  const department = await createDepartment(req.body);

  res.status(201).json({
    success: true,
    message: 'Department created successfully',
    data: department,
  });
});

const list = asyncHandler(async (req, res) => {
  const result = await listDepartments({
    page: req.query.page,
    limit: req.query.limit,
    search: req.query.search,
    includeInactive: req.query.includeInactive === 'true',
    userRole: req.user.role,
  });

  res.status(200).json({
    success: true,
    data: result.items,
    pagination: result.pagination,
  });
});

const details = asyncHandler(async (req, res) => {
  const department = await getDepartmentById({
    departmentId: req.params.departmentId,
    userRole: req.user.role,
    includeInactive: req.query.includeInactive === 'true',
  });

  res.status(200).json({
    success: true,
    data: department,
  });
});

const update = asyncHandler(async (req, res) => {
  const department = await updateDepartment(req.params.departmentId, req.body);

  res.status(200).json({
    success: true,
    message: 'Department updated successfully',
    data: department,
  });
});

const remove = asyncHandler(async (req, res) => {
  const department = await removeDepartment(req.params.departmentId);

  res.status(200).json({
    success: true,
    message: 'Department deactivated successfully',
    data: department,
  });
});

module.exports = {
  create,
  list,
  details,
  update,
  remove,
};
