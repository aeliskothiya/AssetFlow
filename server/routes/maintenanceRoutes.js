const express = require('express');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');
const { maintenanceListSchema, maintenanceCreateSchema, maintenanceUpdateSchema, maintenanceIdSchema } = require('../validators/maintenanceValidators');
const { create, list, details, update } = require('../controllers/maintenanceController');

const router = express.Router();

router.use(protect);
router.get('/', validateRequest(maintenanceListSchema), list);
router.get('/:maintenanceId', validateRequest(maintenanceIdSchema), details);
router.post('/', validateRequest(maintenanceCreateSchema), create);
router.patch('/:maintenanceId', restrictTo('Admin', 'Asset Manager', 'Department Head'), validateRequest(maintenanceUpdateSchema), update);

module.exports = router;
