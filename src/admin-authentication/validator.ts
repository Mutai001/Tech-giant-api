// validator.ts
import { z } from 'zod';

export const registerUserSchema = z.object({
    full_name: z.string().min(2, "Full name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    contact_phone: z.string().optional(),
    address: z.string().optional(),
    role: z.enum(["admin", "therapist", "patient"]).default("patient"),
    password: z.string().min(4, "Password must be at least 4 characters"),
    // Optional fields for therapists
    specialization: z.string().optional(),
    experience_years: z.number().int().optional()
});
// validator.ts
import { z } from 'zod';

export const registerUserSchema = z.object({
    full_name: z.string().min(2, "Full name must be at least 2 characters").trim(),
    email: z.string().email("Invalid email address").trim(),
    contact_phone: z.string().optional().trim(),
    address: z.string().optional().trim(),
    role: z.enum(["admin", "therapist", "patient"]).default("patient"),
    password: z.string().min(4, "Password must be at least 4 characters"),
    // Optional fields for therapists
    specialization: z.string().optional().trim(),
    experience_years: z.number().int().optional()
});

export const loginUserSchema = z.object({
    email: z.string().email("Invalid email address").trim(),
    password: z.string().min(4, "Password must be at least 4 characters")
});
export const loginUserSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(4, "Password must be at least 4 characters")
});