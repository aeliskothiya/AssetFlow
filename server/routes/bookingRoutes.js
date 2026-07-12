const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');
const { bookingListSchema, bookingCreateSchema, bookingUpdateSchema, bookingIdSchema } = require('../validators/bookingValidators');
const { create, list, details, update, remove } = require('../controllers/bookingController');

const router = express.Router();

router.use(protect);
router.get('/', validateRequest(bookingListSchema), list);
router.get('/:bookingId', validateRequest(bookingIdSchema), details);
router.post('/', validateRequest(bookingCreateSchema), create);
router.patch('/:bookingId', validateRequest(bookingUpdateSchema), update);
router.delete('/:bookingId', validateRequest(bookingIdSchema), remove);

module.exports = router;
