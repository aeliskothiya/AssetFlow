const mongoose = require('mongoose');
const nextAssetTag = require('../utils/nextAssetTag');

const assetSchema = new mongoose.Schema(
  {
    assetTag: {
      type: String,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Asset name is required'],
      trim: true,
      maxlength: [150, 'Asset name cannot exceed 150 characters'],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AssetCategory',
      required: [true, 'Asset category is required'],
    },
    serialNumber: {
      type: String,
      required: [true, 'Serial number is required'],
      trim: true,
      unique: true,
      maxlength: [120, 'Serial number cannot exceed 120 characters'],
    },
    purchaseDate: {
      type: Date,
      required: [true, 'Purchase date is required'],
    },
    purchaseCost: {
      type: Number,
      required: [true, 'Purchase cost is required'],
      min: [0, 'Purchase cost cannot be negative'],
    },
    condition: {
      type: String,
      enum: ['New', 'Good', 'Fair', 'Poor', 'Damaged'],
      default: 'Good',
    },
    status: {
      type: String,
      enum: ['Available', 'Allocated', 'Reserved', 'Under Maintenance', 'Lost', 'Retired', 'Disposed'],
      default: 'Available',
    },
    location: {
      type: String,
      trim: true,
      default: '',
    },
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String, required: true },
      },
    ],
    documents: [
      {
        url: { type: String, required: true },
        publicId: { type: String, required: true },
      },
    ],
    sharedBookable: {
      type: Boolean,
      default: false,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    qrCodeUrl: {
      type: String,
      default: '',
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

assetSchema.pre('validate', async function assignAssetTag(next) {
  if (!this.isNew || this.assetTag) {
    return next();
  }

  this.assetTag = await nextAssetTag();
  next();
});

module.exports = mongoose.model('Asset', assetSchema);
