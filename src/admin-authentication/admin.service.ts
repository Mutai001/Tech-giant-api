import { admins } from "../drizzle/schema";
import db from "../drizzle/db";
import { eq } from "drizzle-orm";
import * as bcrypt from 'bcrypt';
import { sign } from 'hono/jwt';

export const createAdminService = async (adminData: {
    fullName: string;
    email: string;
    password: string;
}): Promise<{ success: boolean; message: string; admin?: any }> => {
    try {
        // Check if admin already exists
        const existingAdmin = await db.select()
            .from(admins)
            .where(eq(admins.email, adminData.email));

        if (existingAdmin.length > 0) {
            return { 
                success: false, 
                message: "Admin with this email already exists" 
            };
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(adminData.password, 10);

        // Insert new admin
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
        // Find admin by email
        const [admin] = await db.select()
            .from(admins)
            .where(eq(admins.email, credentials.email));

        if (!admin) {
            return { success: false, message: "Admin not found" };
        }

        // Compare passwords
        const passwordMatch = await bcrypt.compare(
            credentials.password, 
            admin.passwordHash
        );

        if (!passwordMatch) {
            return { success: false, message: "Invalid credentials" };
        }

        // Create JWT token
        const secret = process.env.JWT_SECRET as string;
        const payload = {
            sub: admin.adminId,
            role: 'admin',
            exp: Math.floor(Date.now() / 1000) + (60 * 60 * 3) // 3 hours
        };
        const token = await sign(payload, secret);

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