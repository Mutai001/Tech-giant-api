import { z } from 'zod';

// Common schemas
const passwordSchema = z.string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character");

const emailSchema = z.string().email("Invalid email address");

// Register schema
export const registerSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: emailSchema,
  password: passwordSchema,
  phone: z.string().min(10, "Phone number must be at least 10 characters"),
  address: z.string().optional(),
});

// Login schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

// Verify email schema
export const verifyEmailSchema = z.object({
  email: emailSchema,
  code: z.string().length(6, "Verification code must be 6 digits"),
});

// Resend verification code schema
export const resendVerificationSchema = z.object({
  email: emailSchema,
});

// Login verification schema (for when code is required)
export const loginVerificationSchema = z.object({
  email: emailSchema,
  code: z.string().length(6, "Verification code must be 6 digits"),
});