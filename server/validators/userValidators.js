const { z } = require('zod');

const userListSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(100).optional().default(10),
    search: z.string().trim().optional().default(''),
    role: z.string().trim().optional().default(''),
    department: z.string().trim().optional().default(''),
  }),
});

module.exports = {
  userListSchema,
};
