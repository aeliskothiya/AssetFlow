const express = require('express');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');
const { maintenanceListSchema, maintenanceCreateSchema, maintenanceUpdateSchema, maintenanceIdSchema } = require('../validators/maintenanceValidators');
const { create, list, details, update, approve, assign, progress, resolve } = require('../controllers/maintenanceController');

const router = express.Router();

router.use(protect);
router.get('/', validateRequest(maintenanceListSchema), list);
router.get('/:maintenanceId', validateRequest(maintenanceIdSchema), details);
router.post('/', validateRequest(maintenanceCreateSchema), create);
router.patch('/:maintenanceId', restrictTo('Admin', 'Asset Manager', 'Department Head'), validateRequest(maintenanceUpdateSchema), update);

router.post('/:maintenanceId/approve', restrictTo('Admin', 'Asset Manager'), approve);
router.post('/:maintenanceId/assign', restrictTo('Admin', 'Asset Manager'), assign);
router.post('/:maintenanceId/progress', restrictTo('Admin', 'Asset Manager', 'Technician'), progress);
router.post('/:maintenanceId/resolve', restrictTo('Admin', 'Asset Manager', 'Technician'), resolve);

module.exports = router;
