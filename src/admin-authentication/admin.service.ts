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

        // Updated JWT payload structure
        const payload = {
            sub: admin.adminId.toString(),  // Convert to string as recommended by JWT standards
            role: 'admin',
            email: admin.email,            // Include email for additional verification
            iss: 'your-app-name',          // Issuer identifier
            iat: Math.floor(Date.now() / 1000), // Issued at time
            exp: Math.floor(Date.now() / 1000) + (60 * 60 * 3) // 3 hours expiration
        };

        // Generate token with the enhanced payload
        const token = await sign(payload, process.env.JWT_SECRET);

        return { 
            success: true,
            token,
            admin: {
                id: admin.adminId,
                email: admin.email,
                fullName: admin.fullName,
                // Include token expiration info in the response
                tokenExpires: payload.exp 
            }
        };
    } catch (error) {
        console.error("Login error:", error);
        return { 
            success: false, 
            message: "Login failed",
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
};