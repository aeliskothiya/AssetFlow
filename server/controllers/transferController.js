const asyncHandler = require('../middleware/asyncHandler');
const { createTransfer, listTransfers, getTransfer, updateTransferStatus } = require('../services/transferService');

const create = asyncHandler(async (req, res) => {
  const transfer = await createTransfer(req.body, req.user);
  res.status(201).json({ success: true, message: 'Transfer request created successfully', data: transfer });
});

const list = asyncHandler(async (req, res) => {
  const result = await listTransfers({
    page: parseInt(req.query.page, 10) || 1,
    limit: parseInt(req.query.limit, 10) || 10,
    status: req.query.status,
    user: req.user,
  });
  res.status(200).json({ success: true, data: result.items, pagination: result.pagination });
});

const details = asyncHandler(async (req, res) => {
  const transfer = await getTransfer(req.params.transferId);
  res.status(200).json({ success: true, data: transfer });
});

const updateStatus = asyncHandler(async (req, res) => {
  const { status, comments } = req.body;
  const transfer = await updateTransferStatus(req.params.transferId, status, comments, req.user);
  res.status(200).json({ success: true, message: `Transfer request marked as ${status}`, data: transfer });
});

module.exports = { create, list, details, updateStatus };
