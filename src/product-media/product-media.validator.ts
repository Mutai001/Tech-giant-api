import { z } from 'zod';

export const productMediaSchema = z.object({
  productId: z.number().int().positive("Product ID must be positive"),
  mediaUrl: z.string().url("Invalid URL format"),
  mediaType: z.enum(["image", "video"]),
});

export const updateProductMediaSchema = z.object({
  mediaUrl: z.string().url("Invalid URL format").optional(),
  mediaType: z.enum(["image", "video"]).optional(),
});