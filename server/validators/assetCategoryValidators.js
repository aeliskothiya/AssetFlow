const { z } = require('zod');

const categoryListSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(100).optional().default(10),
    search: z.string().trim().optional().default(''),
    includeInactive: z.union([z.literal('true'), z.literal('false')]).optional().default('false'),
  }),
});

const categoryCreateSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(120),
    description: z.string().trim().max(500).optional().default(''),
    icon: z.string().trim().max(120).optional().default(''),
    isActive: z.boolean().optional(),
  }),
});

const categoryUpdateSchema = z.object({
  params: z.object({
    categoryId: z.string().min(1),
  }),
  body: z.object({
    name: z.string().trim().min(2).max(120).optional(),
    description: z.string().trim().max(500).optional(),
    icon: z.string().trim().max(120).optional(),
    isActive: z.boolean().optional(),
  }),
});

const categoryIdSchema = z.object({
  params: z.object({
    categoryId: z.string().min(1),
  }),
});

module.exports = {
  categoryListSchema,
  categoryCreateSchema,
  categoryUpdateSchema,
  categoryIdSchema,
};
