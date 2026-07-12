const { z } = require('zod');

const departmentIdSchema = z.object({
  params: z.object({
    departmentId: z.string().min(1),
  }),
});

const departmentCreateSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(120),
    code: z.string().trim().min(2).max(20),
    description: z.string().trim().max(500).optional().default(''),
    manager: z.string().trim().min(1).optional().nullable(),
    isActive: z.boolean().optional(),
  }),
});

const departmentUpdateSchema = z.object({
  params: z.object({
    departmentId: z.string().min(1),
  }),
  body: z.object({
    name: z.string().trim().min(2).max(120).optional(),
    code: z.string().trim().min(2).max(20).optional(),
    description: z.string().trim().max(500).optional(),
    manager: z.string().trim().min(1).nullable().optional(),
    isActive: z.boolean().optional(),
  }),
});

const departmentListSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(100).optional().default(10),
    search: z.string().trim().optional().default(''),
    includeInactive: z
      .union([z.literal('true'), z.literal('false')])
      .optional()
      .default('false'),
  }),
});

module.exports = {
  departmentIdSchema,
  departmentCreateSchema,
  departmentUpdateSchema,
  departmentListSchema,
};
