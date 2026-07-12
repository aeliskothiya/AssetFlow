const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');
const { bookingListSchema, bookingCreateSchema, bookingUpdateSchema, bookingIdSchema } = require('../validators/bookingValidators');
const { create, list, details, update, remove, approve, release } = require('../controllers/bookingController');
const { restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.get('/', validateRequest(bookingListSchema), list);
router.get('/:bookingId', validateRequest(bookingIdSchema), details);
router.post('/', validateRequest(bookingCreateSchema), create);
router.patch('/:bookingId', validateRequest(bookingUpdateSchema), update);
router.delete('/:bookingId', validateRequest(bookingIdSchema), remove);

router.post('/:bookingId/approve', restrictTo('Admin', 'Asset Manager'), approve);
router.post('/:bookingId/release', release);

module.exports = router;
