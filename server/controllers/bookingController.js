const asyncHandler = require('../middleware/asyncHandler');
const { createBooking, listBookings, getBooking, updateBooking, cancelBooking } = require('../services/bookingService');

const create = asyncHandler(async (req, res) => {
  const booking = await createBooking(req.body, req.user);
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
  res.status(200).json({ success: true, message: 'Booking updated successfully', data: booking });
});

const remove = asyncHandler(async (req, res) => {
  const booking = await cancelBooking(req.params.bookingId, req.user);
  res.status(200).json({ success: true, message: 'Booking cancelled successfully', data: booking });
});

module.exports = { create, list, details, update, remove };
