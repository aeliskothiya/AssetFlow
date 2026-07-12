const express = require('express');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');
const {
  allocationListSchema,
  allocationCreateSchema,
  allocationReturnSchema,
  allocationIdSchema,
} = require('../validators/allocationValidators');
const { create, list, details, returnAsset } = require('../controllers/allocationController');

const router = express.Router();

router.use(protect);
router.get('/', validateRequest(allocationListSchema), list);
router.get('/:allocationId', validateRequest(allocationIdSchema), details);
router.post('/', restrictTo('Admin', 'Asset Manager'), validateRequest(allocationCreateSchema), create);
router.patch('/:allocationId/return', restrictTo('Admin', 'Asset Manager'), validateRequest(allocationReturnSchema), returnAsset);

module.exports = router;
