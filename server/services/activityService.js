const ActivityLog = require('../models/ActivityLog');
const Notification = require('../models/Notification');
const { sendNotificationToUser } = require('../socket');

const recordLog = async (userId, action, payload = {}) => {
  const { entityId, entityType, details } = payload;
  return ActivityLog.create({
    user: userId,
    action,
    entityId,
    entityType,
    details,
  });
};

const createNotification = async (userId, title, message, link) => {
  const notification = await Notification.create({
    user: userId,
    title,
    message,
    link,
  });
  
  sendNotificationToUser(userId, notification);
  return notification;
};

const listLogs = async ({ page, limit, search }) => {
  const query = {};
  if (search) {
    query.$or = [
      { action: { $regex: search, $options: 'i' } },
      { details: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    ActivityLog.find(query).populate('user', 'name email role').sort({ createdAt: -1 }).skip(skip).limit(limit),
    ActivityLog.countDocuments(query),
  ]);

  return { items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 } };
};

module.exports = { recordLog, createNotification, listLogs };
