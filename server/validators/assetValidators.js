const { z } = require('zod');

const imageSchema = z.object({
  url: z.string().trim().url(),
  publicId: z.string().trim().min(1),
});

const documentSchema = z.object({
  url: z.string().trim().url(),
  publicId: z.string().trim().min(1),
});

const assetListSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(100).optional().default(10),
    search: z.string().trim().optional().default(''),
    status: z.string().trim().optional().default(''),
    category: z.string().trim().optional().default(''),
    department: z.string().trim().optional().default(''),
  }),
});

const assetCreateSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(150),
    category: z.string().trim().min(1),
    serialNumber: z.string().trim().min(1).max(120),
    purchaseDate: z.string().trim().min(1),
    purchaseCost: z.coerce.number().min(0),
    condition: z.enum(['New', 'Good', 'Fair', 'Poor', 'Damaged']).optional(),
    status: z.enum(['Available', 'Allocated', 'Reserved', 'Under Maintenance', 'Lost', 'Retired', 'Disposed']).optional(),
    location: z.string().trim().max(255).optional().default(''),
    images: z.array(imageSchema).optional().default([]),
    documents: z.array(documentSchema).optional().default([]),
    sharedBookable: z.boolean().optional().default(false),
    department: z.string().trim().min(1).nullable().optional(),
    notes: z.string().trim().max(2000).optional().default(''),
  }),
});

const assetUpdateSchema = z.object({
  params: z.object({
    assetId: z.string().min(1),
  }),
  body: z.object({
    name: z.string().trim().min(2).max(150).optional(),
    category: z.string().trim().min(1).optional(),
    serialNumber: z.string().trim().min(1).max(120).optional(),
    purchaseDate: z.string().trim().min(1).optional(),
    purchaseCost: z.coerce.number().min(0).optional(),
    condition: z.enum(['New', 'Good', 'Fair', 'Poor', 'Damaged']).optional(),
    status: z.enum(['Available', 'Allocated', 'Reserved', 'Under Maintenance', 'Lost', 'Retired', 'Disposed']).optional(),
    location: z.string().trim().max(255).optional(),
    images: z.array(imageSchema).optional(),
    documents: z.array(documentSchema).optional(),
    sharedBookable: z.boolean().optional(),
    department: z.string().trim().min(1).nullable().optional(),
    notes: z.string().trim().max(2000).optional(),
  }),
});

const assetIdSchema = z.object({
  params: z.object({
    assetId: z.string().min(1),
  }),
});

module.exports = {
  assetListSchema,
  assetCreateSchema,
  assetUpdateSchema,
  assetIdSchema,
};
