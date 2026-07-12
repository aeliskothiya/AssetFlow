const mongoose = require('mongoose');

const auditRecordSchema = new mongoose.Schema(
  {
    cycle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AuditCycle',
      required: [true, 'Audit cycle is required'],
    },
    asset: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Asset',
      required: [true, 'Asset is required'],
    },
    auditedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Audited by is required'],
    },
    auditedAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['Verified', 'Missing', 'Damaged', 'Mismatch'],
      required: [true, 'Audit status is required'],
    },
    conditionObserved: {
      type: String,
      enum: ['New', 'Good', 'Fair', 'Poor', 'Damaged'],
      default: 'Good',
    },
    locationObserved: {
      type: String,
      trim: true,
      default: '',
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
      default: '',
    },
    discrepancyNotes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Discrepancy notes cannot exceed 1000 characters'],
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

auditRecordSchema.index({ cycle: 1, asset: 1 }, { unique: true });

module.exports = mongoose.model('AuditRecord', auditRecordSchema);
