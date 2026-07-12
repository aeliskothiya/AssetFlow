const mongoose = require('mongoose');

const allocationSchema = new mongoose.Schema(
  {
    asset: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Asset',
      required: true,
    },
    allocatedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      default: null,
    },
    allocatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    purpose: {
      type: String,
      trim: true,
      maxlength: [500, 'Purpose cannot exceed 500 characters'],
      default: '',
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
      default: '',
    },
    status: {
      type: String,
      enum: ['Active', 'Returned', 'Cancelled'],
      default: 'Active',
    },
    allocatedAt: {
      type: Date,
      default: Date.now,
    },
    expectedReturnDate: {
      type: Date,
      default: null,
    },
    returnedAt: {
      type: Date,
      default: null,
    },
    returnNotes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Return notes cannot exceed 1000 characters'],
      default: '',
    },
  },
  { timestamps: true }
);

allocationSchema.index({ asset: 1, status: 1 });

module.exports = mongoose.model('Allocation', allocationSchema);
