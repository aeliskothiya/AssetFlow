const asyncHandler = require('../middleware/asyncHandler');
const { registerEmployee, loginUser, getProfile, promoteUserRole } = require('../services/authService');

const signUp = asyncHandler(async (req, res) => {
  const result = await registerEmployee(req.body);

  res.status(201).json({
    success: true,
    message: 'Employee account created successfully',
    ...result,
  });
});

const signIn = asyncHandler(async (req, res) => {
  const result = await loginUser(req.body);

  res.status(200).json({
    success: true,
    message: 'Login successful',
    ...result,
  });
});

const me = asyncHandler(async (req, res) => {
  const user = await getProfile(req.user.id);

  res.status(200).json({
    success: true,
    data: user,
  });
});

const updateUserRole = asyncHandler(async (req, res) => {
  const user = await promoteUserRole({
    userId: req.params.userId,
    role: req.body.role,
  });

  res.status(200).json({
    success: true,
    message: 'User role updated successfully',
    data: user,
  });
});

module.exports = {
  signUp,
  signIn,
  me,
  updateUserRole,
};
