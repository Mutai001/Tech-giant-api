import { users } from "../drizzle/schema";
import db from "../drizzle/db";
import { eq, and, gt } from "drizzle-orm";
import * as bcrypt from 'bcrypt';
import { sign } from 'hono/jwt';
import { generateRandomCode } from '../utils/code';
import { sendVerificationEmail } from '../services/email.service';

export const registerUser = async (userData: {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  address?: string;
  role?: string;
}) => {
  try {
    // Check if user already exists
    const [existingUser] = await db.select()
      .from(users)
      .where(eq(users.email, userData.email));

    if (existingUser) {
      return { 
        success: false, 
        message: "User with this email already exists" 
      };
    }

    // Check if phone is taken
    const [phoneUser] = await db.select()
      .from(users)
      .where(eq(users.phone, userData.phone));

    if (phoneUser) {
      return { 
        success: false, 
        message: "Phone number already in use" 
      };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    // Generate verification code
    const verificationCode = generateRandomCode(6);
    const verificationCodeExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes from now

    // Create user
    const [newUser] = await db.insert(users).values({
      fullName: userData.fullName,
      email: userData.email,
      passwordHash: hashedPassword,
      phone: userData.phone,
      address: userData.address,
      role: userData.role || 'user',
      verificationCode,
      verificationCodeExpires,
    }).returning();

    // Send verification email
    await sendVerificationEmail(newUser.email, verificationCode);

    return { 
      success: true, 
      message: "User registered successfully. Please check your email for verification code.",
      user: {
        id: newUser.userId,
        email: newUser.email,
        fullName: newUser.fullName,
        role: newUser.role,
        isVerified: newUser.isVerified
      }
    };
  } catch (error) {
    console.error("Error registering user:", error);
    return { success: false, message: "Failed to register user" };
  }
};

export const verifyEmail = async (email: string, code: string) => {
  try {
    const [user] = await db.select()
      .from(users)
      .where(
        and(
          eq(users.email, email),
          eq(users.verificationCode, code),
          gt(users.verificationCodeExpires, new Date())
        )
      );

    if (!user) {
      return { 
        success: false, 
        message: "Invalid or expired verification code" 
      };
    }

    // Update user as verified and clear verification code
    await db.update(users)
      .set({ 
        isVerified: true,
        verificationCode: null,
        verificationCodeExpires: null
      })
      .where(eq(users.userId, user.userId));

    return { 
      success: true, 
      message: "Email verified successfully",
      user: {
        id: user.userId,
        email: user.email,
        isVerified: true
      }
    };
  } catch (error) {
    console.error("Error verifying email:", error);
    return { success: false, message: "Failed to verify email" };
  }
};

export const resendVerificationCode = async (email: string) => {
  try {
    const [user] = await db.select()
      .from(users)
      .where(eq(users.email, email));

    if (!user) {
      return { 
        success: false, 
        message: "User not found" 
      };
    }

    if (user.isVerified) {
      return { 
        success: false, 
        message: "Email is already verified" 
      };
    }

    // Generate new verification code
    const verificationCode = generateRandomCode(6);
    const verificationCodeExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes from now

    // Update user with new code
    await db.update(users)
      .set({ 
        verificationCode,
        verificationCodeExpires
      })
      .where(eq(users.userId, user.userId));

    // Send verification email
    await sendVerificationEmail(user.email, verificationCode);

    return { 
      success: true, 
      message: "Verification code resent successfully" 
    };
  } catch (error) {
    console.error("Error resending verification code:", error);
    return { success: false, message: "Failed to resend verification code" };
  }
};

export const loginUser = async (credentials: {
  email: string;
  password: string;
}) => {
  try {
    const [user] = await db.select()
      .from(users)
      .where(eq(users.email, credentials.email));

    if (!user) {
      return { success: false, message: "User not found" };
    }

    // Check password
    const passwordMatch = await bcrypt.compare(
      credentials.password, 
      user.passwordHash
    );

    if (!passwordMatch) {
      return { success: false, message: "Invalid credentials" };
    }

    // If user is not verified, require email verification
    if (!user.isVerified) {
      // Generate new verification code for login
      const verificationCode = generateRandomCode(6);
      const verificationCodeExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes for login codes

      await db.update(users)
        .set({ 
          verificationCode,
          verificationCodeExpires
        })
        .where(eq(users.userId, user.userId));

      // Send verification email
      await sendVerificationEmail(user.email, verificationCode);

      return { 
        success: false, 
        requiresVerification: true,
        message: "Please verify your email with the code we just sent"
      };
    }

    // Generate JWT token
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not configured");
    }

    const payload = {
      sub: user.userId.toString(),
      role: user.role,
      email: user.email,
      iss: 'your-app-name',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (60 * 60 * 3) // 3 hours expiration
    };

    const token = await sign(payload, process.env.JWT_SECRET);

    return { 
      success: true,
      token,
      user: {
        id: user.userId,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
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

export const verifyLogin = async (email: string, code: string) => {
  try {
    // First verify the code
    const verifyResult = await verifyEmail(email, code);
    if (!verifyResult.success) {
      return verifyResult;
    }

    // Then proceed with login
    const [user] = await db.select()
      .from(users)
      .where(eq(users.email, email));

    if (!user) {
      return { success: false, message: "User not found" };
    }

    // Generate JWT token
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not configured");
    }

    const payload = {
      sub: user.userId.toString(),
      role: user.role,
      email: user.email,
      iss: 'your-app-name',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (60 * 60 * 3) // 3 hours expiration
    };

    const token = await sign(payload, process.env.JWT_SECRET);

    return { 
      success: true,
      token,
      user: {
        id: user.userId,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        tokenExpires: payload.exp
      }
    };
  } catch (error) {
    console.error("Verify login error:", error);
    return { 
      success: false, 
      message: "Login verification failed",
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};