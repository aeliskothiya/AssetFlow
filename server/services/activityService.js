const ActivityLog = require('../models/ActivityLog');
const Notification = require('../models/Notification');
const { sendNotificationToUser } = require('../socket');

const Asset = require('../models/Asset');

const recordLog = async (userId, action, payload = {}) => {
  let { entityId, entityType, details } = payload;

  // Deduce entityType and entityId if not explicitly provided
  if (!entityId) {
    if (payload.assetId) {
      entityId = payload.assetId;
      entityType = 'Asset';
    } else if (payload.bookingId) {
      entityId = payload.bookingId;
      entityType = 'Booking';
    } else if (payload.maintenanceId) {
      entityId = payload.maintenanceId;
      entityType = 'Maintenance';
    } else if (payload.transferId) {
      entityId = payload.transferId;
      entityType = 'Transfer';
    } else if (payload.allocationId) {
      entityId = payload.allocationId;
      entityType = 'Allocation';
    } else if (payload.cycleId) {
      entityId = payload.cycleId;
      entityType = 'AuditCycle';
    }
  }

  // Generate friendly details
  if (!details) {
    if (entityType === 'Asset' && entityId) {
      try {
        const asset = await Asset.findById(entityId);
        details = asset ? `Asset: ${asset.assetTag} (${asset.name})` : `Asset ID: ${entityId}`;
      } catch (err) {
        details = `Asset ID: ${entityId}`;
      }
    } else if (entityType) {
      details = `${entityType} transaction reference: ${entityId}`;
    } else {
      details = 'System operations check';
    }
  }

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
