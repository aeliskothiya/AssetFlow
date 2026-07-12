const Asset = require('../models/Asset');
const Booking = require('../models/Booking');
const Maintenance = require('../models/Maintenance');
const AuditCycle = require('../models/AuditCycle');
const AuditRecord = require('../models/AuditRecord');
const Department = require('../models/Department');

const departmentReport = async () => {
  const departments = await Department.find({}).sort({ name: 1 });
  const [assetsByDepartment, bookingsByDepartment, maintenanceByDepartment] = await Promise.all([
    Asset.aggregate([{ $match: { department: { $ne: null } } }, { $group: { _id: '$department', totalAssets: { $sum: 1 }, allocatedAssets: { $sum: { $cond: [{ $eq: ['$status', 'Allocated'] }, 1, 0] } } } }]),
    Booking.aggregate([{ $match: { department: { $ne: null } } }, { $group: { _id: '$department', totalBookings: { $sum: 1 } } }]),
    Maintenance.aggregate([{ $match: { department: { $ne: null } } }, { $group: { _id: '$department', totalMaintenance: { $sum: 1 } } }]),
  ]);

  const rows = departments.map((department) => {
    const assetRow = assetsByDepartment.find((item) => String(item._id) === String(department._id)) || {};
    const bookingRow = bookingsByDepartment.find((item) => String(item._id) === String(department._id)) || {};
    const maintenanceRow = maintenanceByDepartment.find((item) => String(item._id) === String(department._id)) || {};

    return {
      department: department.name,
      code: department.code,
      totalAssets: assetRow.totalAssets || 0,
      allocatedAssets: assetRow.allocatedAssets || 0,
      totalBookings: bookingRow.totalBookings || 0,
      totalMaintenance: maintenanceRow.totalMaintenance || 0,
    };
  });

  return rows;
};

const assetReport = async () => {
  const [byStatus, byCategory, total] = await Promise.all([
    Asset.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Asset.aggregate([
      { $lookup: { from: 'assetcategories', localField: 'category', foreignField: '_id', as: 'category' } },
      { $unwind: '$category' },
      { $group: { _id: '$category.name', count: { $sum: 1 } } },
    ]),
    Asset.countDocuments({}),
  ]);
  return { total, byStatus, byCategory };
};

const maintenanceReport = async () => {
  const [byStatus, byPriority, total] = await Promise.all([
    Maintenance.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Maintenance.aggregate([{ $group: { _id: '$priority', count: { $sum: 1 } } }]),
    Maintenance.countDocuments({}),
  ]);
  return { total, byStatus, byPriority };
};

const auditReport = async () => {
  const [cycles, byStatus, discrepancyCount] = await Promise.all([
    AuditCycle.find({}).sort({ createdAt: -1 }).populate('department auditor createdBy'),
    AuditRecord.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    AuditRecord.countDocuments({ status: { $in: ['Missing', 'Damaged', 'Mismatch'] } }),
  ]);

  return { cycles, byStatus, discrepancyCount };
};

const bookingReport = async () => {
  const [byStatus, total] = await Promise.all([
    Booking.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Booking.countDocuments({}),
  ]);
  return { total, byStatus };
};

module.exports = {
  departmentReport,
  assetReport,
  maintenanceReport,
  auditReport,
  bookingReport,
};
