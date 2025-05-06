// src/middleware/bearAuth.ts
import { Hono } from "hono";
import jwt from "jsonwebtoken";
import { db } from "../drizzle/db";
import { admins } from "../drizzle/schema";
import { eq } from "drizzle-orm";

// Define types for your JWT payload
interface JWTPayload {
  id: number;
  email: string;
  exp: number;
}

// Create a middleware that authenticates and authorizes admin users
import { Context } from "hono";

export const adminRoleAuth = async (c: Context<{ Variables: { adminId: number } }>) => {
  // Get Authorization header
  const authHeader = c.req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json({ error: "Unauthorized: Missing or invalid token" }, 401);
  }

  const token = authHeader.split(" ")[1];

  try {
    // Verify JWT
    const secret = process.env.JWT_SECRET || "your-secret-key";
    const decoded = jwt.verify(token, secret) as JWTPayload;

    // Check if admin exists in DB
    const [admin] = await db
      .select()
      .from(admins)
      .where(eq(admins.adminId, decoded.id));

    if (!admin) {
      return c.json({ error: "Forbidden: Admin not found" }, 403);
    }

    // Attach admin ID to context
    c.set("adminId", admin.adminId);

    // Continue processing
    return c.json({ message: "Authentication successful" }, 200);
  } catch (error) {
    console.error("Auth error:", error);
    return c.json({ error: "Unauthorized: Invalid or expired token" }, 401);
  }
};