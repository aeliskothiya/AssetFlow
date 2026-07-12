const { z } = require('zod');

const signUpSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(100),
    email: z.string().trim().toLowerCase().email(),
    password: z.string().min(8).max(128),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().trim().toLowerCase().email(),
    password: z.string().min(1),
  }),
});

const promoteUserSchema = z.object({
  params: z.object({
    userId: z.string().min(1),
  }),
  body: z.object({
    role: z.enum(['Admin', 'Asset Manager', 'Department Head', 'Employee']),
  }),
});

module.exports = {
  signUpSchema,
  loginSchema,
  promoteUserSchema,
};
