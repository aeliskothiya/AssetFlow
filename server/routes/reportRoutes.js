const express = require('express');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const { department, assets, maintenance, audit, bookings } = require('../controllers/reportController');

const router = express.Router();

router.use(protect, restrictTo('Admin', 'Asset Manager', 'Department Head'));
router.get('/department', department);
router.get('/assets', assets);
router.get('/maintenance', maintenance);
router.get('/audit', audit);
router.get('/bookings', bookings);

module.exports = router;
