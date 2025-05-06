import { Context } from "hono";
import { createAdminService, getAdminByEmailService } from "./admin.service";
import * as bcrypt from 'bcrypt';

export const registerAdmin = async (c: Context) => {
    try {
        const adminData = await c.req.json();
        
        // Check if admin already exists
        const existingAdmin = await getAdminByEmailService(adminData.email);
        if (existingAdmin) {
            return c.json({ error: "Admin with this email already exists" }, 409);
        }

        // Create admin
        const result = await createAdminService(adminData);
        
        if (!result.success) {
            return c.json({ error: result.message }, 400);
        }

        return c.json({ message: result.message }, 201);

    } catch (error: any) {
        console.error("Admin registration error:", error);
        return c.json({ error: error?.message || "Admin registration failed" }, 500);
    }
};