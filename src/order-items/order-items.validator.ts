import { z } from 'zod';

export const orderItemSchema = z.object({
  orderId: z.number().int().positive("Order ID must be positive"),
  productId: z.number().int().positive("Product ID must be positive"),
  quantity: z.number().int().positive("Quantity must be at least 1"),
  priceAtPurchase: z.number().positive("Price must be positive"),
  discountApplied: z.number().min(0).default(0)
});

export const orderItemUpdateSchema = z.object({
  quantity: z.number().int().positive("Quantity must be at least 1").optional(),
  discountApplied: z.number().min(0).optional()
});

export const orderItemIdSchema = z.object({
  id: z.number().int().positive("Order item ID must be positive")
});