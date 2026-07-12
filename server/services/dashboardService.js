const Asset = require('../models/Asset');
const Allocation = require('../models/Allocation');
const Booking = require('../models/Booking');
const Maintenance = require('../models/Maintenance');
const TransferRequest = require('../models/TransferRequest');
const AuditCycle = require('../models/AuditCycle');
const AuditRecord = require('../models/AuditRecord');
const Department = require('../models/Department');

const getDashboardOverview = async () => {
  const now = new Date();

  const [assetsAvailable, assetsAllocated, maintenanceToday, upcomingAllocations, upcomingBookings, overdueAllocations, overdueBookings, pendingTransfers, activeBookings] = await Promise.all([
    Asset.countDocuments({ status: 'Available' }),
    Asset.countDocuments({ status: 'Allocated' }),
    Maintenance.countDocuments({ status: { $in: ['Approved', 'Technician Assigned', 'In Progress'] } }),
    Allocation.countDocuments({ status: 'Active', expectedReturnDate: { $gte: now } }),
    Booking.countDocuments({ status: { $in: ['Upcoming', 'Ongoing'] }, endAt: { $gte: now } }),
    Allocation.countDocuments({ status: 'Active', expectedReturnDate: { $lt: now } }),
    Booking.countDocuments({ status: 'Ongoing', endAt: { $lt: now } }),
    TransferRequest.countDocuments({ status: 'Requested' }),
    Booking.countDocuments({ status: { $in: ['Upcoming', 'Ongoing'] } }),
  ]);

  const upcomingReturns = upcomingAllocations + upcomingBookings;
  const overdueReturns = overdueAllocations + overdueBookings;

  const [departmentAllocation, assetUtilization, maintenanceFrequency, bookingHeatmap, auditSummary] = await Promise.all([
    Asset.aggregate([
      { $match: { department: { $ne: null } } },
      { $group: { _id: '$department', count: { $sum: 1 } } },
      {
        $lookup: {
          from: 'departments',
          localField: '_id',
          foreignField: '_id',
          as: 'department',
        },
      },
      { $unwind: '$department' },
      { $project: { _id: 0, department: '$department.name', count: 1 } },
      { $sort: { count: -1 } },
    ]),
    Asset.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }, { $project: { _id: 0, status: '$_id', count: 1 } }]),
    Maintenance.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }, { $project: { _id: 0, status: '$_id', count: 1 } }]),
    Booking.aggregate([
      {
        $group: {
          _id: { day: { $dayOfWeek: '$startAt' }, hour: { $hour: '$startAt' } },
          count: { $sum: 1 },
        },
      },
      { $project: { _id: 0, day: '$_id.day', hour: '$_id.hour', count: 1 } },
      { $sort: { day: 1, hour: 1 } },
    ]),
    Promise.all([
      AuditCycle.countDocuments({ status: 'Planned' }),
      AuditCycle.countDocuments({ status: 'In Progress' }),
      AuditCycle.countDocuments({ status: 'Completed' }),
      AuditRecord.countDocuments({ status: 'Missing' }),
      AuditRecord.countDocuments({ status: 'Damaged' }),
    ]),
  ]);

  return {
    kpis: {
      assetsAvailable,
      assetsAllocated,
      maintenanceToday,
      upcomingReturns,
      overdueReturns,
      pendingTransfers,
      activeBookings,
    },
    charts: {
      departmentAllocation,
      assetUtilization,
      maintenanceFrequency,
      bookingHeatmap,
      auditSummary: {
        planned: auditSummary[0],
        inProgress: auditSummary[1],
        completed: auditSummary[2],
        missing: auditSummary[3],
        damaged: auditSummary[4],
      },
    },
  };
};

module.exports = {
  getDashboardOverview,
};
