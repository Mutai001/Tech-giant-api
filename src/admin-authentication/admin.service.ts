import { admins } from "../drizzle/schema";
import db from "../drizzle/db";
import { eq } from "drizzle-orm";
import * as bcrypt from 'bcrypt';
import { sign } from 'hono/jwt';

export const createAdminService = async (adminData: {
    fullName: string;
    email: string;
    password: string;
}) => {
    try {
        const [existingAdmin] = await db.select()
            .from(admins)
            .where(eq(admins.email, adminData.email));

        if (existingAdmin) {
            return { 
                success: false, 
                message: "Admin with this email already exists" 
            };
        }

        const hashedPassword = await bcrypt.hash(adminData.password, 10);
        const [newAdmin] = await db.insert(admins).values({
            fullName: adminData.fullName,
            email: adminData.email,
            passwordHash: hashedPassword
        }).returning();

        return { 
            success: true, 
            message: "Admin created successfully",
            admin: {
                id: newAdmin.adminId,
                email: newAdmin.email,
                fullName: newAdmin.fullName
            }
        };
    } catch (error) {
        console.error("Error creating admin:", error);
        return { success: false, message: "Failed to create admin" };
    }
};

export const loginAdminService = async (credentials: {
    email: string;
    password: string;
}) => {
    try {
        const [admin] = await db.select()
            .from(admins)
            .where(eq(admins.email, credentials.email));

        if (!admin) {
            return { success: false, message: "Admin not found" };
        }

        const passwordMatch = await bcrypt.compare(
            credentials.password, 
            admin.passwordHash
        );

        if (!passwordMatch) {
            return { success: false, message: "Invalid credentials" };
        }

        // Ensure JWT_SECRET is properly set in your environment
        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET is not configured");
        }

        const payload = {
            sub: admin.adminId,
            role: 'admin',
            exp: Math.floor(Date.now() / 1000) + (60 * 60 * 3) // 3 hours
        };

        const token = await sign(payload, process.env.JWT_SECRET);

        return { 
            success: true,
            token,
            admin: {
                id: admin.adminId,
                email: admin.email,
                fullName: admin.fullName
            }
        };
    } catch (error) {
        console.error("Login error:", error);
        return { success: false, message: "Login failed" };
    }
};