import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  categoryId: z.number().optional(),
  price: z.number().positive("Price must be positive"),
  discountPrice: z.number().positive().optional(),
  stockLeft: z.number().int().nonnegative("Stock cannot be negative"),
  badge: z.string().optional(),
  description: z.string().optional(),
});

export const productMediaSchema = z.object({
  productId: z.number(),
  mediaUrl: z.string().url("Invalid URL format"),
  mediaType: z.enum(["image", "video"]),
});