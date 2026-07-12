const asyncHandler = require('../middleware/asyncHandler');
const { createAllocation, listAllocations, getAllocation, returnAllocation } = require('../services/allocationService');

const create = asyncHandler(async (req, res) => {
  const allocation = await createAllocation(req.body, req.user.id);
  res.status(201).json({ success: true, message: 'Asset allocated successfully', data: allocation });
});

const list = asyncHandler(async (req, res) => {
  const result = await listAllocations({
    page: req.query.page,
    limit: req.query.limit,
    search: req.query.search,
    status: req.query.status,
  });
  res.status(200).json({ success: true, data: result.items, pagination: result.pagination });
});

const details = asyncHandler(async (req, res) => {
  const allocation = await getAllocation(req.params.allocationId);
  res.status(200).json({ success: true, data: allocation });
});

const returnAsset = asyncHandler(async (req, res) => {
  const allocation = await returnAllocation(req.params.allocationId, req.body.returnNotes);
  res.status(200).json({ success: true, message: 'Asset returned successfully', data: allocation });
});

module.exports = { create, list, details, returnAsset };
