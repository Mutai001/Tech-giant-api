// auth.controller.ts
import "dotenv/config";
import { Context } from "hono";
import { createAuthUserService, userLoginService, getUserByEmailService } from "./auth.service";
import * as bcrypt from "bcrypt";
import { sign } from "hono/jwt";

export const registerUser = async (c: Context) => {
    try {
        const user = await c.req.json();
        
        // Check if user already exists
        const existingUser = await getUserByEmailService(user.email);
        if (existingUser) {
            return c.json({ error: "User already exists. Please login." }, 409);
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(user.password, 10);
        user.password = hashedPassword;

        // Create user
        const createdUser = await createAuthUserService(user);
        
        if (!createdUser) {
            return c.json({ error: "Failed to create user" }, 400);
        }

        return c.json({ message: createdUser }, 201);

    } catch (error: any) {
        console.error("Registration error:", error);
        return c.json({ error: error?.message || "Registration failed" }, 500);
    }
};

export const loginUser = async (c: Context) => {
    try {
        const user = await c.req.json();
        
        // Check user exists
        const userExist = await userLoginService(user);
        
        if (!userExist) {
            return c.json({ error: "User not found" }, 404);
        }

        // Compare passwords
        const userMatch = await bcrypt.compare(
            user.password, 
            userExist.password
        );

        if (!userMatch) {
            return c.json({ error: "Invalid login details" }, 401);
        }

        // Create payload
        const payload = {
            sub: userExist.user_id,
            role: userExist.role,
            exp: Math.floor(Date.now() / 1000) + (60 * 180) // 3 hours
        };

        // Generate token
        const secret = process.env.JWT_SECRET as string;
        const token = await sign(payload, secret);

        // Return user info and token
        return c.json({ 
            token, 
            user: {
                id: userExist.user.id,
                full_name: userExist.user.full_name,
                email: userExist.user.email,
                role: userExist.user.role
            } 
        }, 200);

    } catch (error: any) {
        console.error("Login error:", error);
        return c.json({ error: error?.message || "Login failed" }, 500);
    }
};