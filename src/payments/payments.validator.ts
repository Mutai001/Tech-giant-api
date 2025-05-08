import { z } from 'zod';

// Payment method and status enums
const paymentMethodSchema = z.enum(["mpesa", "card", "cash"]);
const paymentStatusSchema = z.enum(["pending", "completed", "failed"]);

// Base payment schema
export const paymentSchema = z.object({
  orderId: z.number().int().positive("Order ID must be positive"),
  userId: z.number().int().positive("User ID must be positive"),
  method: paymentMethodSchema,
  amount: z.number().positive("Amount must be positive"),
  phoneNumber: z.string().min(10, "Invalid phone number").optional(),
  status: paymentStatusSchema.default("pending")
});

// M-Pesa specific schema
export const mpesaPaymentSchema = paymentSchema.extend({
  method: z.literal("mpesa"),
  phoneNumber: z.string().min(10, "M-Pesa phone number required")
});

// Payment update schema
export const paymentUpdateSchema = z.object({
  status: paymentStatusSchema,
  transactionCode: z.string().min(1, "Transaction code required").optional(),
  merchantRequestId: z.string().optional(),
  checkoutRequestId: z.string().optional()
});

// ID schema
export const paymentIdSchema = z.object({
  id: z.number().int().positive("Payment ID must be positive")
});