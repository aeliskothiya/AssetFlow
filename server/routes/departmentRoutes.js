const express = require('express');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');
const {
  departmentCreateSchema,
  departmentUpdateSchema,
  departmentListSchema,
  departmentIdSchema,
} = require('../validators/departmentValidators');
const {
  create,
  list,
  details,
  update,
  remove,
} = require('../controllers/departmentController');

const router = express.Router();

router.use(protect);

router.get('/', validateRequest(departmentListSchema), list);
router.get('/:departmentId', validateRequest(departmentIdSchema), details);
router.post('/', restrictTo('Admin', 'Asset Manager'), validateRequest(departmentCreateSchema), create);
router.patch('/:departmentId', restrictTo('Admin', 'Asset Manager'), validateRequest(departmentUpdateSchema), update);
router.delete('/:departmentId', restrictTo('Admin', 'Asset Manager'), validateRequest(departmentIdSchema), remove);

module.exports = router;
