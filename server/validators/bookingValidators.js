const { z } = require('zod');

const bookingListSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(100).optional().default(10),
    search: z.string().trim().optional().default(''),
    status: z.string().trim().optional().default(''),
  }),
});

const bookingCreateSchema = z.object({
  body: z.object({
    asset: z.string().trim().min(1),
    startAt: z.string().trim().min(1),
    endAt: z.string().trim().min(1),
    department: z.string().trim().min(1).nullable().optional(),
    purpose: z.string().trim().max(500).optional().default(''),
    notes: z.string().trim().max(1000).optional().default(''),
  }),
});

const bookingUpdateSchema = z.object({
  params: z.object({
    bookingId: z.string().min(1),
  }),
  body: z.object({
    startAt: z.string().trim().min(1).optional(),
    endAt: z.string().trim().min(1).optional(),
    notes: z.string().trim().max(1000).optional().default(''),
    purpose: z.string().trim().max(500).optional(),
    status: z.enum(['Upcoming', 'Ongoing', 'Completed', 'Cancelled']).optional(),
  }),
});

const bookingIdSchema = z.object({
  params: z.object({
    bookingId: z.string().min(1),
  }),
});

module.exports = {
  bookingListSchema,
  bookingCreateSchema,
  bookingUpdateSchema,
  bookingIdSchema,
};
