import { admins } from "../drizzle/schema";
import db from "../drizzle/db";
import { eq } from "drizzle-orm";
import * as bcrypt from 'bcrypt';

export const createAdminService = async (adminData: {
    fullName: string;
    email: string;
    password: string;
}): Promise<{ success: boolean; message: string }> => {
    try {
        // Check if admin already exists
        const existingAdmin = await db.select()
            .from(admins)
            .where(eq(admins.email, adminData.email))
            .limit(1);

        if (existingAdmin.length > 0) {
            return { success: false, message: "Admin with this email already exists" };
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(adminData.password, 10);

        // Insert new admin
        await db.insert(admins).values({
            fullName: adminData.fullName,
            email: adminData.email,
            passwordHash: hashedPassword
        });

        return { success: true, message: "Admin created successfully" };
    } catch (error) {
        console.error("Error creating admin:", error);
        return { success: false, message: "Failed to create admin" };
    }
};

export const getAdminByEmailService = async (email: string) => {
    return await db.query.admins.findFirst({
        where: eq(admins.email, email)
    });
};