const { z } = require('zod');

const allocationListSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(100).optional().default(10),
    search: z.string().trim().optional().default(''),
    status: z.string().trim().optional().default(''),
  }),
});

const allocationCreateSchema = z.object({
  body: z.object({
    asset: z.string().trim().min(1),
    allocatedTo: z.string().trim().min(1),
    department: z.string().trim().min(1).nullable().optional(),
    purpose: z.string().trim().max(500).optional().default(''),
    notes: z.string().trim().max(1000).optional().default(''),
    expectedReturnDate: z.coerce.date().nullable().optional(),
  }),
});

const allocationReturnSchema = z.object({
  params: z.object({
    allocationId: z.string().min(1),
  }),
  body: z.object({
    returnNotes: z.string().trim().max(1000).optional().default(''),
  }),
});

const allocationIdSchema = z.object({
  params: z.object({
    allocationId: z.string().min(1),
  }),
});

module.exports = {
  allocationListSchema,
  allocationCreateSchema,
  allocationReturnSchema,
  allocationIdSchema,
};
