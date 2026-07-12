const asyncHandler = require('../middleware/asyncHandler');
const {
  createCycle,
  listCycles,
  getCycle,
  updateCycle,
  cancelCycle,
  addRecord,
  listRecords,
  generateDiscrepancyPdf,
} = require('../services/auditService');
const { recordLog } = require('../services/activityService');

const create = asyncHandler(async (req, res) => {
  const cycle = await createCycle(req.body, req.user.id);
  await recordLog(req.user.id, 'Audit Cycle Created', { cycleId: cycle._id });
  res.status(201).json({ success: true, message: 'Audit cycle created successfully', data: cycle });
});

const list = asyncHandler(async (req, res) => {
  const result = await listCycles({
    page: req.query.page,
    limit: req.query.limit,
    search: req.query.search,
    status: req.query.status,
  });
  res.status(200).json({ success: true, data: result.items, pagination: result.pagination });
});

const details = asyncHandler(async (req, res) => {
  const cycle = await getCycle(req.params.cycleId);
  res.status(200).json({ success: true, data: cycle });
});

const update = asyncHandler(async (req, res) => {
  const cycle = await updateCycle(req.params.cycleId, req.body);
  await recordLog(req.user.id, 'Audit Cycle Updated', { cycleId: cycle._id });
  res.status(200).json({ success: true, message: 'Audit cycle updated successfully', data: cycle });
});

const remove = asyncHandler(async (req, res) => {
  const cycle = await cancelCycle(req.params.cycleId);
  res.status(200).json({ success: true, message: 'Audit cycle cancelled successfully', data: cycle });
});

const createRecord = asyncHandler(async (req, res) => {
  const record = await addRecord(req.params.cycleId, req.body, req.user.id);
  await recordLog(req.user.id, 'Audit Record Added', { cycleId: req.params.cycleId, assetId: record.asset });
  res.status(201).json({ success: true, message: 'Audit record saved successfully', data: record });
});

const listCycleRecords = asyncHandler(async (req, res) => {
  const result = await listRecords(req.params.cycleId);
  res.status(200).json({ success: true, data: result.items, summary: result.summary });
});

const exportPdf = asyncHandler(async (req, res) => {
  const pdfBuffer = await generateDiscrepancyPdf(req.params.cycleId);
  res.header('Content-Type', 'application/pdf');
  res.attachment(`audit-discrepancy-${req.params.cycleId}.pdf`);
  res.send(pdfBuffer);
});

module.exports = {
  create,
  list,
  details,
  update,
  remove,
  createRecord,
  listCycleRecords,
  exportPdf,
};
