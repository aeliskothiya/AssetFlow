const express = require('express');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');
const { assetListSchema, assetUpdateSchema, assetIdSchema } = require('../validators/assetValidators');
const { create, list, details, update, remove } = require('../controllers/assetController');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.use(protect);
router.get('/', validateRequest(assetListSchema), list);
router.get('/:assetId', validateRequest(assetIdSchema), details);
router.post('/', restrictTo('Admin', 'Asset Manager'), upload.single('photo'), create);
router.patch('/:assetId', restrictTo('Admin', 'Asset Manager'), upload.single('photo'), validateRequest(assetUpdateSchema), update);
router.delete('/:assetId', restrictTo('Admin', 'Asset Manager'), validateRequest(assetIdSchema), remove);

module.exports = router;
