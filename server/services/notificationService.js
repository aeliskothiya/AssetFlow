const Notification = require('../models/Notification');

const listNotifications = async ({ userId, page, limit, unreadOnly }) => {
  const query = { user: userId };
  if (unreadOnly) query.read = false;

  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    Notification.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Notification.countDocuments(query),
  ]);

  return { items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 } };
};

const markAsRead = async (notificationId, userId) => {
  const notification = await Notification.findOne({ _id: notificationId, user: userId });
  if (!notification) return null;
  notification.read = true;
  await notification.save();
  return notification;
};

const markAllAsRead = async (userId) => {
  await Notification.updateMany({ user: userId, read: false }, { read: true });
};

module.exports = { listNotifications, markAsRead, markAllAsRead };
