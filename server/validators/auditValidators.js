const { z } = require('zod');

const auditCycleListSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(100).optional().default(10),
    search: z.string().trim().optional().default(''),
    status: z.string().trim().optional().default(''),
  }),
});

const auditCycleCreateSchema = z.object({
  body: z.object({
    title: z.string().trim().min(2).max(150),
    description: z.string().trim().max(1000).optional().default(''),
    department: z.string().trim().min(1).nullable().optional(),
    auditor: z.string().trim().min(1),
    scheduledAt: z.string().trim().min(1),
    notes: z.string().trim().max(1000).optional().default(''),
  }),
});

const auditCycleUpdateSchema = z.object({
  params: z.object({
    cycleId: z.string().min(1),
  }),
  body: z.object({
    title: z.string().trim().min(2).max(150).optional(),
    description: z.string().trim().max(1000).optional(),
    department: z.string().trim().min(1).nullable().optional(),
    auditor: z.string().trim().min(1).optional(),
    scheduledAt: z.string().trim().min(1).optional(),
    status: z.enum(['Planned', 'In Progress', 'Completed', 'Cancelled']).optional(),
    notes: z.string().trim().max(1000).optional(),
  }),
});

const auditCycleIdSchema = z.object({
  params: z.object({
    cycleId: z.string().min(1),
  }),
});

const auditRecordCreateSchema = z.object({
  params: z.object({
    cycleId: z.string().min(1),
  }),
  body: z.object({
    asset: z.string().trim().min(1),
    status: z.enum(['Verified', 'Missing', 'Damaged', 'Mismatch']),
    conditionObserved: z.enum(['New', 'Good', 'Fair', 'Poor', 'Damaged']).optional(),
    locationObserved: z.string().trim().max(255).optional().default(''),
    notes: z.string().trim().max(1000).optional().default(''),
    discrepancyNotes: z.string().trim().max(1000).optional().default(''),
  }),
});

const auditRecordListSchema = z.object({
  params: z.object({
    cycleId: z.string().min(1),
  }),
  query: z.object({}),
});

module.exports = {
  auditCycleListSchema,
  auditCycleCreateSchema,
  auditCycleUpdateSchema,
  auditCycleIdSchema,
  auditRecordCreateSchema,
  auditRecordListSchema,
};
