const { z } = require('zod');

const maintenanceListSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(100).optional().default(10),
    search: z.string().trim().optional().default(''),
    status: z.string().trim().optional().default(''),
  }),
});

const maintenanceCreateSchema = z.object({
  body: z.object({
    asset: z.string().trim().min(1),
    issueDescription: z.string().trim().min(5).max(1000),
    department: z.string().trim().min(1).nullable().optional(),
    priority: z.enum(['Low', 'Medium', 'High', 'Critical']).optional(),
    scheduledAt: z.string().trim().min(1).optional().nullable(),
  }),
});

const maintenanceUpdateSchema = z.object({
  params: z.object({
    maintenanceId: z.string().min(1),
  }),
  body: z.object({
    status: z.enum(['Pending', 'Approved', 'Rejected', 'Technician Assigned', 'In Progress', 'Resolved']).optional(),
    technician: z.string().trim().min(1).nullable().optional(),
    assignedBy: z.string().trim().min(1).nullable().optional(),
    resolutionNotes: z.string().trim().max(1000).optional(),
    scheduledAt: z.string().trim().min(1).optional().nullable(),
  }),
});

const maintenanceIdSchema = z.object({
  params: z.object({
    maintenanceId: z.string().min(1),
  }),
});

module.exports = {
  maintenanceListSchema,
  maintenanceCreateSchema,
  maintenanceUpdateSchema,
  maintenanceIdSchema,
};
