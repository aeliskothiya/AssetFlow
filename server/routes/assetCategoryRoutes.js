const express = require('express');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');
const {
  categoryListSchema,
  categoryCreateSchema,
  categoryUpdateSchema,
  categoryIdSchema,
} = require('../validators/assetCategoryValidators');
const { create, list, details, update, remove } = require('../controllers/assetCategoryController');

const router = express.Router();

router.use(protect);
router.get('/', validateRequest(categoryListSchema), list);
router.get('/:categoryId', validateRequest(categoryIdSchema), details);
router.post('/', restrictTo('Admin'), validateRequest(categoryCreateSchema), create);
router.patch('/:categoryId', restrictTo('Admin'), validateRequest(categoryUpdateSchema), update);
router.delete('/:categoryId', restrictTo('Admin'), validateRequest(categoryIdSchema), remove);

module.exports = router;
