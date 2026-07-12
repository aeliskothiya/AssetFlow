const Asset = require('../models/Asset');
const Allocation = require('../models/Allocation');
const Booking = require('../models/Booking');
const Maintenance = require('../models/Maintenance');
const TransferRequest = require('../models/TransferRequest');
const AuditCycle = require('../models/AuditCycle');
const AuditRecord = require('../models/AuditRecord');

const getDashboardOverview = async (user) => {
  const now = new Date();

  // Determine query scopes based on user role
  let assetFilter = {};
  let allocationFilter = {};
  let bookingFilter = {};
  let maintenanceFilter = {};
  let transferFilter = {};

  if (user.role === 'Employee') {
    allocationFilter = { user: user._id };
    bookingFilter = { user: user._id };
    maintenanceFilter = { requestedBy: user._id };
    transferFilter = { requestedBy: user._id };
    // Employees don't really have a global asset count that is meaningful beyond what is allocated to them
  } else if (user.role === 'Department Head') {
    assetFilter = { department: user.department };
    allocationFilter = { department: user.department };
    bookingFilter = { department: user.department }; // if bookings are tied to department
    maintenanceFilter = { department: user.department };
    transferFilter = { $or: [{ fromDepartment: user.department }, { toDepartment: user.department }] };
  }

  const [assetsAvailable, assetsAllocated, maintenanceToday, upcomingAllocations, upcomingBookings, overdueAllocations, overdueBookings, pendingTransfers, activeBookings] = await Promise.all([
    Asset.countDocuments({ ...assetFilter, status: 'Available' }),
    Asset.countDocuments({ ...assetFilter, status: 'Allocated' }),
    Maintenance.countDocuments({ ...maintenanceFilter, status: { $in: ['Approved', 'Technician Assigned', 'In Progress'] } }),
    Allocation.countDocuments({ ...allocationFilter, status: 'Active', expectedReturnDate: { $gte: now } }),
    Booking.countDocuments({ ...bookingFilter, status: { $in: ['Upcoming', 'Ongoing'] }, endAt: { $gte: now } }),
    Allocation.countDocuments({ ...allocationFilter, status: 'Active', expectedReturnDate: { $lt: now } }),
    Booking.countDocuments({ ...bookingFilter, status: 'Ongoing', endAt: { $lt: now } }),
    TransferRequest.countDocuments({ ...transferFilter, status: 'Requested' }),
    Booking.countDocuments({ ...bookingFilter, status: { $in: ['Upcoming', 'Ongoing'] } }),
  ]);

  const upcomingReturns = upcomingAllocations + upcomingBookings;
  const overdueReturns = overdueAllocations + overdueBookings;

  let charts = {
    departmentAllocation: [],
    assetUtilization: [],
    maintenanceFrequency: [],
    bookingHeatmap: [],
    auditSummary: { planned: 0, inProgress: 0, completed: 0, missing: 0, damaged: 0 },
  };

  // Only Admin and Asset Manager get organization charts
  if (user.role === 'Admin' || user.role === 'Asset Manager') {
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

    charts = {
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
    };
  } else if (user.role === 'Department Head') {
    const [assetUtilization, maintenanceFrequency] = await Promise.all([
      Asset.aggregate([{ $match: { department: user.department } }, { $group: { _id: '$status', count: { $sum: 1 } } }, { $project: { _id: 0, status: '$_id', count: 1 } }]),
      Maintenance.aggregate([{ $match: { department: user.department } }, { $group: { _id: '$status', count: { $sum: 1 } } }, { $project: { _id: 0, status: '$_id', count: 1 } }]),
    ]);
    charts.assetUtilization = assetUtilization;
    charts.maintenanceFrequency = maintenanceFrequency;
  }

  let totalEmployees = 0;
  if (['Admin', 'Asset Manager'].includes(user.role)) {
    const User = require('../models/User');
    totalEmployees = await User.countDocuments({ role: 'Employee', isActive: true });
  }

  return {
    kpis: {
      totalEmployees,
      assetsAvailable,
      assetsAllocated,
      maintenanceToday,
      upcomingReturns,
      overdueReturns,
      pendingTransfers,
      activeBookings,
    },
    charts,
  };
};

module.exports = {
  getDashboardOverview,
};
