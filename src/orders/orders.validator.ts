import { z } from 'zod';

// Common schemas
const statusSchema = z.enum(["pending", "paid", "shipped", "delivered", "cancelled"]);
const paymentStatusSchema = z.enum(["unpaid", "pending", "paid", "failed", "refunded"]);

// Order schemas
export const orderSchema = z.object({
  userId: z.number().int().positive("User ID must be positive"),
  status: statusSchema.optional().default("pending"),
  totalAmount: z.number().positive("Amount must be positive"),
  paymentStatus: paymentStatusSchema.optional().default("unpaid"),
  shippingAddress: z.string().min(10, "Address too short"),
  contactPhone: z.string().min(10, "Invalid phone number"),
  trackingNumber: z.string().optional(),
  items: z.array(z.object({
    productId: z.number().int().positive("Product ID must be positive"),
    quantity: z.number().int().positive("Quantity must be at least 1"),
    priceAtPurchase: z.number().positive("Price must be positive"),
    discountApplied: z.number().min(0).default(0)
  })).min(1, "Order must have at least one item")
});

export const orderUpdateSchema = z.object({
  status: statusSchema.optional(),
  paymentStatus: paymentStatusSchema.optional(),
  trackingNumber: z.string().optional()
});

export const orderIdSchema = z.object({
  id: z.number().int().positive("Order ID must be positive")
});