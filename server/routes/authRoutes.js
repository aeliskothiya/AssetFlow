const express = require('express');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const { signUpSchema, loginSchema, promoteUserSchema } = require('../validators/authValidators');
const { signUp, signIn, me, updateUserRole } = require('../controllers/authController');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();

router.post('/signup', validateRequest(signUpSchema), signUp);
router.post('/login', validateRequest(loginSchema), signIn);
router.get('/me', protect, me);
router.patch('/users/:userId/role', protect, restrictTo('Admin'), validateRequest(promoteUserSchema), updateUserRole);

module.exports = router;
