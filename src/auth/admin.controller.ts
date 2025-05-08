import { Context } from "hono";
import { createAdminService, loginAdminService } from "./admin.service";

export const registerAdmin = async (c: Context) => {
    try {
        const adminData = await c.req.json();
        const result = await createAdminService(adminData);
        
        if (!result.success) {
            return c.json({ error: result.message }, 400);
        }

        return c.json({ 
            message: result.message,
            admin: result.admin 
        }, 201);

    } catch (error: any) {
        console.error("Admin registration error:", error);
        return c.json({ error: error?.message || "Admin registration failed" }, 500);
    }
};

export const loginAdmin = async (c: Context) => {
    try {
        const credentials = await c.req.json();
        const result = await loginAdminService(credentials);
        
        if (!result.success) {
            return c.json({ error: result.message }, 401);
        }

        return c.json({
            token: result.token,
            admin: result.admin
        }, 200);

    } catch (error: any) {
        console.error("Admin login error:", error);
        return c.json({ 
            error: error?.message || "Admin login failed",
            details: error instanceof Error ? error.message : 'Unknown error'
        }, 500);
    }
};