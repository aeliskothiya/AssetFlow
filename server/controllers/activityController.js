const asyncHandler = require('../middleware/asyncHandler');
const { listNotifications, markAsRead, markAllAsRead } = require('../services/notificationService');
const { listLogs } = require('../services/activityService');

const getNotifications = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const unreadOnly = req.query.unread === 'true';

  const result = await listNotifications({ userId: req.user.id, page, limit, unreadOnly });
  res.status(200).json({ success: true, data: result.items, pagination: result.pagination });
});

const markNotificationRead = asyncHandler(async (req, res) => {
  const notification = await markAsRead(req.params.id, req.user.id);
  if (!notification) {
    res.status(404);
    throw new Error('Notification not found');
  }
  res.status(200).json({ success: true, data: notification });
});

const markAllNotificationsRead = asyncHandler(async (req, res) => {
  await markAllAsRead(req.user.id);
  res.status(200).json({ success: true, message: 'All notifications marked as read' });
});

const getLogs = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const search = req.query.search;

  const result = await listLogs({ page, limit, search });
  res.status(200).json({ success: true, data: result.items, pagination: result.pagination });
});

module.exports = { getNotifications, markNotificationRead, markAllNotificationsRead, getLogs };
