const mongoose = require('mongoose');
const AuditCycle = require('../models/AuditCycle');
const AuditRecord = require('../models/AuditRecord');
const Asset = require('../models/Asset');
const Department = require('../models/Department');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');

const populateCycle = [
  { path: 'department' },
  { path: 'auditor', select: 'name email role' },
  { path: 'createdBy', select: 'name email role' },
];

const populateRecord = [
  { path: 'cycle', populate: populateCycle },
  { path: 'asset', populate: [{ path: 'category' }, { path: 'department' }] },
  { path: 'auditedBy', select: 'name email role' },
];

const validateDepartment = async (departmentId) => {
  if (!departmentId) return null;
  if (!mongoose.Types.ObjectId.isValid(departmentId)) throw new ApiError(400, 'Invalid department id');
  const department = await Department.findById(departmentId);
  if (!department || !department.isActive) throw new ApiError(404, 'Department not found');
  return department._id;
};

const validateUser = async (userId, message) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) throw new ApiError(400, message);
  const user = await User.findById(userId);
  if (!user || !user.isActive) throw new ApiError(404, message);
  return user._id;
};

const createCycle = async (payload, userId) => {
  const departmentId = await validateDepartment(payload.department || null);
  const auditorId = await validateUser(payload.auditor, 'Auditor user not found');

  const cycle = await AuditCycle.create({
    title: payload.title.trim(),
    description: payload.description?.trim() || '',
    department: departmentId,
    auditor: auditorId,
    createdBy: userId,
    scheduledAt: new Date(payload.scheduledAt),
    notes: payload.notes?.trim() || '',
  });

  await cycle.populate(populateCycle);
  return cycle;
};

const listCycles = async ({ page, limit, search, status }) => {
  const query = {};
  if (status) query.status = status;
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { notes: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    AuditCycle.find(query).populate(populateCycle).sort({ createdAt: -1 }).skip(skip).limit(limit),
    AuditCycle.countDocuments(query),
  ]);

  return { items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 } };
};

const getCycle = async (cycleId) => {
  const cycle = await AuditCycle.findById(cycleId).populate(populateCycle);
  if (!cycle) throw new ApiError(404, 'Audit cycle not found');
  return cycle;
};

const updateCycle = async (cycleId, payload) => {
  const cycle = await AuditCycle.findById(cycleId);
  if (!cycle) throw new ApiError(404, 'Audit cycle not found');

  if (payload.department !== undefined) cycle.department = await validateDepartment(payload.department);
  if (payload.auditor) cycle.auditor = await validateUser(payload.auditor, 'Auditor user not found');
  if (payload.title) cycle.title = payload.title.trim();
  if (payload.description !== undefined) cycle.description = payload.description.trim();
  if (payload.scheduledAt) cycle.scheduledAt = new Date(payload.scheduledAt);
  if (payload.status) cycle.status = payload.status;
  if (payload.notes !== undefined) cycle.notes = payload.notes.trim();

  if (cycle.status === 'In Progress' && !cycle.startedAt) cycle.startedAt = new Date();
  if (cycle.status === 'Completed' && !cycle.completedAt) cycle.completedAt = new Date();

  await cycle.save();
  await cycle.populate(populateCycle);
  return cycle;
};

const cancelCycle = async (cycleId) => {
  const cycle = await AuditCycle.findById(cycleId);
  if (!cycle) throw new ApiError(404, 'Audit cycle not found');
  cycle.status = 'Cancelled';
  await cycle.save();
  await cycle.populate(populateCycle);
  return cycle;
};

const addRecord = async (cycleId, payload, userId) => {
  if (!mongoose.Types.ObjectId.isValid(payload.asset)) throw new ApiError(400, 'Invalid asset id');
  const cycle = await AuditCycle.findById(cycleId);
  if (!cycle) throw new ApiError(404, 'Audit cycle not found');

  const asset = await Asset.findById(payload.asset);
  if (!asset) throw new ApiError(404, 'Asset not found');

  const existing = await AuditRecord.findOne({ cycle: cycleId, asset: payload.asset });
  if (existing) throw new ApiError(409, 'Asset already audited in this cycle');

  const record = await AuditRecord.create({
    cycle: cycleId,
    asset: asset._id,
    auditedBy: userId,
    status: payload.status,
    conditionObserved: payload.conditionObserved || asset.condition,
    locationObserved: payload.locationObserved?.trim() || asset.location || '',
    notes: payload.notes?.trim() || '',
    discrepancyNotes: payload.discrepancyNotes?.trim() || '',
  });

  if (record.status === 'Missing') {
    asset.status = 'Lost';
    await asset.save();
  } else if (record.status === 'Damaged') {
    asset.condition = 'Damaged';
    asset.status = 'Under Maintenance';
    await asset.save();
  }

  await record.populate(populateRecord);
  return record;
};

const listRecords = async (cycleId) => {
  const cycle = await AuditCycle.findById(cycleId);
  if (!cycle) throw new ApiError(404, 'Audit cycle not found');

  const items = await AuditRecord.find({ cycle: cycleId }).populate(populateRecord).sort({ createdAt: -1 });
  const totals = await AuditRecord.aggregate([
    { $match: { cycle: cycle._id } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  const summary = totals.reduce(
    (accumulator, item) => {
      accumulator[item._id.toLowerCase()] = item.count;
      return accumulator;
    },
    { verified: 0, missing: 0, damaged: 0, mismatch: 0 }
  );

  return { items, summary };
};

const PDFDocument = require('pdfkit');

const generateDiscrepancyPdf = async (cycleId) => {
  const cycle = await AuditCycle.findById(cycleId).populate(populateCycle);
  if (!cycle) throw new ApiError(404, 'Audit cycle not found');

  const discrepancies = await AuditRecord.find({
    cycle: cycleId,
    status: { $in: ['Missing', 'Damaged', 'Mismatch'] },
  }).populate(populateRecord);

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      doc.fontSize(20).text(`Audit Discrepancy Report`, { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Cycle: ${cycle.title}`);
      doc.text(`Department: ${cycle.department?.name || 'All'}`);
      doc.text(`Auditor: ${cycle.auditor?.name || 'N/A'}`);
      doc.text(`Date: ${new Date().toLocaleDateString()}`);
      doc.moveDown(2);

      if (discrepancies.length === 0) {
        doc.fontSize(14).text('No discrepancies found.', { align: 'center' });
      } else {
        discrepancies.forEach((record, index) => {
          doc.fontSize(12).font('Helvetica-Bold').text(`${index + 1}. Asset: ${record.asset.name} (${record.asset.assetTag})`);
          doc.font('Helvetica').text(`Status: ${record.status}`);
          doc.text(`Condition Observed: ${record.conditionObserved}`);
          doc.text(`Notes: ${record.discrepancyNotes || 'None'}`);
          doc.moveDown();
        });
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  createCycle,
  listCycles,
  getCycle,
  updateCycle,
  cancelCycle,
  addRecord,
  listRecords,
  generateDiscrepancyPdf,
};
