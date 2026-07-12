const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Asset = require('../models/Asset');
const Department = require('../models/Department');
const ApiError = require('../utils/ApiError');

const populateBooking = [
  { path: 'asset', populate: [{ path: 'category' }, { path: 'department' }] },
  { path: 'bookedBy', select: 'name email role' },
  { path: 'department' },
  { path: 'approvedBy', select: 'name email role' },
];

const hasOverlap = async (assetId, startAt, endAt, bookingId = null) => {
  const query = {
    asset: assetId,
    status: { $ne: 'Cancelled' },
    startAt: { $lt: endAt },
    endAt: { $gt: startAt },
  };
  if (bookingId) query._id = { $ne: bookingId };
  return Booking.exists(query);
};

const refreshAssetBookingStatus = async (assetId) => {
  const activeBooking = await Booking.exists({
    asset: assetId,
    status: { $in: ['Upcoming', 'Ongoing'] },
  });
  const asset = await Asset.findById(assetId);
  if (asset) {
    asset.status = activeBooking ? 'Reserved' : 'Available';
    await asset.save();
  }
};

const createBooking = async (payload, user) => {
  if (!mongoose.Types.ObjectId.isValid(payload.asset)) throw new ApiError(400, 'Invalid asset id');
  if (payload.department && !mongoose.Types.ObjectId.isValid(payload.department)) throw new ApiError(400, 'Invalid department id');

  const asset = await Asset.findById(payload.asset);
  if (!asset) throw new ApiError(404, 'Asset not found');
  if (!asset.sharedBookable) throw new ApiError(400, 'Asset is not available for booking');
  if (['Allocated', 'Under Maintenance', 'Lost', 'Retired', 'Disposed'].includes(asset.status)) {
    throw new ApiError(400, 'Asset is not available for booking');
  }

  const startAt = new Date(payload.startAt);
  const endAt = new Date(payload.endAt);
  if (Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime()) || startAt >= endAt) {
    throw new ApiError(400, 'Booking time range is invalid');
  }

  if (await hasOverlap(asset._id, startAt, endAt)) {
    throw new ApiError(400, 'Booking overlaps with an existing booking');
  }

  if (payload.department) {
    const department = await Department.findById(payload.department);
    if (!department || !department.isActive) throw new ApiError(404, 'Department not found');
  }

  const booking = await Booking.create({
    asset: asset._id,
    bookedBy: user.id,
    department: payload.department || asset.department || null,
    startAt,
    endAt,
    purpose: payload.purpose?.trim() || '',
    notes: payload.notes?.trim() || '',
  });

  asset.status = 'Reserved';
  await asset.save();

  await booking.populate(populateBooking);
  return booking;
};

const listBookings = async ({ page, limit, search, status, user }) => {
  const query = {};
  if (status) query.status = status;
  if (!['Admin', 'Asset Manager'].includes(user.role)) query.bookedBy = user.id;
  if (search) {
    query.$or = [];
  }
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    Booking.find(query).populate(populateBooking).sort({ startAt: -1 }).skip(skip).limit(limit),
    Booking.countDocuments(query),
  ]);
  return { items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 } };
};

const getBooking = async (bookingId) => {
  const booking = await Booking.findById(bookingId).populate(populateBooking);
  if (!booking) throw new ApiError(404, 'Booking not found');
  return booking;
};

const updateBooking = async (bookingId, payload, user) => {
  const booking = await Booking.findById(bookingId);
  if (!booking) throw new ApiError(404, 'Booking not found');

  if (!['Admin', 'Asset Manager'].includes(user.role) && booking.bookedBy.toString() !== user.id) {
    throw new ApiError(403, 'Forbidden: insufficient permissions');
  }

  const startAt = payload.startAt ? new Date(payload.startAt) : booking.startAt;
  const endAt = payload.endAt ? new Date(payload.endAt) : booking.endAt;
  if (Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime()) || startAt >= endAt) {
    throw new ApiError(400, 'Booking time range is invalid');
  }

  if (await hasOverlap(booking.asset, startAt, endAt, bookingId)) {
    throw new ApiError(400, 'Booking overlaps with an existing booking');
  }

  booking.startAt = startAt;
  booking.endAt = endAt;
  if (payload.purpose !== undefined) booking.purpose = payload.purpose.trim();
  if (payload.notes !== undefined) booking.notes = payload.notes.trim();
  if (payload.status) booking.status = payload.status;
  await booking.save();

  await refreshAssetBookingStatus(booking.asset);
  await booking.populate(populateBooking);
  return booking;
};

const cancelBooking = async (bookingId, user) => {
  const booking = await Booking.findById(bookingId);
  if (!booking) throw new ApiError(404, 'Booking not found');
  if (!['Admin', 'Asset Manager'].includes(user.role) && booking.bookedBy.toString() !== user.id) {
    throw new ApiError(403, 'Forbidden: insufficient permissions');
  }

  booking.status = 'Cancelled';
  await booking.save();
  await refreshAssetBookingStatus(booking.asset);
  await booking.populate(populateBooking);
  return booking;
};

module.exports = { createBooking, listBookings, getBooking, updateBooking, cancelBooking };
