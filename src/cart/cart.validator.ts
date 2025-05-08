import { z } from 'zod';

export const cartItemSchema = z.object({
  userId: z.number().int().positive("User ID must be a positive integer"),
  productId: z.number().int().positive("Product ID must be a positive integer"),
  quantity: z.number().int().positive("Quantity must be at least 1")
});

export const cartItemUpdateSchema = z.object({
  quantity: z.number().int().positive("Quantity must be at least 1")
});

export const cartIdSchema = z.object({
  id: z.number().int().positive("Cart item ID must be a positive integer")
});