const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true }, // e.g., 'allocation_created', 'booking_cancelled'
  entityId: { type: mongoose.Schema.Types.ObjectId },
  entityType: { type: String }, // e.g., 'Asset', 'Booking'
  details: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
