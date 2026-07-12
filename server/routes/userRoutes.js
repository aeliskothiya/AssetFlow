const express = require('express');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');
const { userListSchema } = require('../validators/userValidators');
const { list } = require('../controllers/userController');

const router = express.Router();

router.use(protect);
router.get('/', restrictTo('Admin', 'Asset Manager', 'Department Head'), validateRequest(userListSchema), list);

module.exports = router;
