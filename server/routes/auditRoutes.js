const express = require('express');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');
const {
  auditCycleListSchema,
  auditCycleCreateSchema,
  auditCycleUpdateSchema,
  auditCycleIdSchema,
  auditRecordCreateSchema,
} = require('../validators/auditValidators');
const {
  create,
  list,
  details,
  update,
  remove,
  createRecord,
  listCycleRecords,
  exportPdf,
} = require('../controllers/auditController');

const router = express.Router();

router.use(protect);
router.get('/', validateRequest(auditCycleListSchema), list);
router.get('/:cycleId', validateRequest(auditCycleIdSchema), details);
router.get('/:cycleId/records', validateRequest(auditCycleIdSchema), listCycleRecords);
router.get('/:cycleId/export/pdf', validateRequest(auditCycleIdSchema), exportPdf);
router.post('/', restrictTo('Admin', 'Asset Manager'), validateRequest(auditCycleCreateSchema), create);
router.patch('/:cycleId', restrictTo('Admin', 'Asset Manager'), validateRequest(auditCycleUpdateSchema), update);
router.delete('/:cycleId', restrictTo('Admin', 'Asset Manager'), validateRequest(auditCycleIdSchema), remove);
router.post('/:cycleId/records', restrictTo('Admin', 'Asset Manager', 'Department Head'), validateRequest(auditRecordCreateSchema), createRecord);

module.exports = router;
