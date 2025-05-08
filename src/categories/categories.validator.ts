import { z } from 'zod';

export const categorySchema = z.object({
  name: z.string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name cannot exceed 50 characters"),
  description: z.string().optional()
});

export const categoryIdSchema = z.object({
  id: z.number().int().positive("ID must be a positive integer")
});

export const categoryUpdateSchema = categorySchema.partial();