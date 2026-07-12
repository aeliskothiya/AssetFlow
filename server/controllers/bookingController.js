const asyncHandler = require('../middleware/asyncHandler');
const { createBooking, listBookings, getBooking, updateBooking, cancelBooking, approveBooking, releaseBooking } = require('../services/bookingService');
const { recordLog, createNotification } = require('../services/activityService');

const create = asyncHandler(async (req, res) => {
  const booking = await createBooking(req.body, req.user);
  await recordLog(req.user.id, 'Resource Booked', { bookingId: booking._id, assetId: booking.asset });
  await createNotification(booking.bookedBy, 'Booking Confirmed', `Your booking has been confirmed.`, '/bookings');
  res.status(201).json({ success: true, message: 'Booking created successfully', data: booking });
});

const list = asyncHandler(async (req, res) => {
  const result = await listBookings({
    page: req.query.page,
    limit: req.query.limit,
    search: req.query.search,
    status: req.query.status,
    user: req.user,
  });
  res.status(200).json({ success: true, data: result.items, pagination: result.pagination });
});

const details = asyncHandler(async (req, res) => {
  const booking = await getBooking(req.params.bookingId);
  res.status(200).json({ success: true, data: booking });
});

const update = asyncHandler(async (req, res) => {
  const booking = await updateBooking(req.params.bookingId, req.body, req.user);
  await recordLog(req.user.id, 'Booking Updated', { bookingId: booking._id, assetId: booking.asset });
  res.status(200).json({ success: true, message: 'Booking updated successfully', data: booking });
});

const remove = asyncHandler(async (req, res) => {
  const booking = await cancelBooking(req.params.bookingId, req.user);
  await recordLog(req.user.id, 'Booking Cancelled', { bookingId: booking._id, assetId: booking.asset });
  await createNotification(booking.bookedBy, 'Booking Cancelled', `Your booking has been cancelled.`, '/bookings');
  res.status(200).json({ success: true, message: 'Booking cancelled successfully', data: booking });
});

const approve = asyncHandler(async (req, res) => {
  const booking = await approveBooking(req.params.bookingId, req.user);
  await recordLog(req.user.id, 'Booking Approved', { bookingId: booking._id, assetId: booking.asset });
  await createNotification(booking.bookedBy, 'Booking Approved', `Your booking for ${booking.asset.name} has been approved.`, '/bookings');
  res.status(200).json({ success: true, message: 'Booking approved successfully', data: booking });
});

const release = asyncHandler(async (req, res) => {
  const booking = await releaseBooking(req.params.bookingId, req.user);
  await recordLog(req.user.id, 'Booking Released', { bookingId: booking._id, assetId: booking.asset });
  res.status(200).json({ success: true, message: 'Booking released successfully', data: booking });
});

module.exports = { create, list, details, update, remove, approve, release };
