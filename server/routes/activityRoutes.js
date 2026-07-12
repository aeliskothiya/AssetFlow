const express = require('express');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const { getNotifications, markNotificationRead, markAllNotificationsRead, getLogs } = require('../controllers/activityController');

const router = express.Router();

router.use(protect);

router.get('/notifications', getNotifications);
router.patch('/notifications/:id/read', markNotificationRead);
router.post('/notifications/read-all', markAllNotificationsRead);

router.get('/logs', restrictTo('Admin'), getLogs);

module.exports = router;
