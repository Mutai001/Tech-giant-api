import { Context } from "hono";
import { 
  registerUser, 
  loginUser, 
  verifyEmail, 
  resendVerificationCode,
  verifyLogin,
  changePassword,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser
} from "./auth.service";
import { 
  registerSchema, 
  loginSchema, 
  verifyEmailSchema,
  resendVerificationSchema,
  loginVerificationSchema
} from "./auth.validator";

// Define strict response types
type UserData = {
  id: number;
  email: string;
  fullName: string;
  role: string;
  tokenExpires?: number;
  isVerified?: boolean;
};

type AuthSuccessResponse = {
  success: true;
  message?: string;
  user: UserData;
  token?: string;
  requiresVerification?: never;
};

type AuthErrorResponse = {
  success: false;
  message: string;
  user?: never;
  token?: never;
  requiresVerification?: boolean;
};

type AuthResponse = AuthSuccessResponse | AuthErrorResponse;

const handleJsonParseError = async (c: Context) => {
  try {
    return await c.req.json();
  } catch (error) {
    throw new Error("Invalid JSON format in request body");
  }
};

export const register = async (c: Context) => {
  try {
    const userData = await handleJsonParseError(c);
    const result = await registerUser(userData) as AuthResponse;
    
    if (!result.success) {
      return c.json({ error: result.message }, 400);
    }

    return c.json({ 
      message: result.message || "Registration successful",
      user: result.user 
    }, 201);

  } catch (error: any) {
    console.error("Registration error:", error);
    return c.json({ 
      error: error?.message || "Registration failed",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
};

export const login = async (c: Context) => {
  try {
    const credentials = await handleJsonParseError(c);
    const result = await loginUser(credentials) as AuthResponse;
    
    if (!result.success) {
      if (result.requiresVerification) {
        return c.json({ 
          requiresVerification: true,
          message: result.message 
        }, 401);
      }
      return c.json({ error: result.message }, 401);
    }

    if (!result.token) {
      throw new Error("Authentication token not generated");
    }

    return c.json({
      token: result.token,
      user: result.user
    }, 200);

  } catch (error: any) {
    console.error("Login error:", error);
    return c.json({ 
      error: error?.message || "Login failed",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
};

export const verify = async (c: Context) => {
  try {
    const { email, code } = await handleJsonParseError(c);
    
    if (!email || !code) {
      return c.json({ error: "Email and code are required" }, 400);
    }

    const result = await verifyEmail(email, code) as AuthResponse;
    
    if (!result.success) {
      return c.json({ error: result.message }, 400);
    }

    return c.json({ 
      message: result.message || "Verification successful",
      user: result.user 
    }, 200);

  } catch (error: any) {
    console.error("Verification error:", error);
    return c.json({ 
      error: error?.message || "Verification failed",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
};

export const resendCode = async (c: Context) => {
  try {
    const { email } = await handleJsonParseError(c);
    
    if (!email) {
      return c.json({ error: "Email is required" }, 400);
    }

    const result = await resendVerificationCode(email) as AuthResponse;
    
    if (!result.success) {
      return c.json({ error: result.message }, 400);
    }

    return c.json({ 
      message: result.message || "Verification code resent"
    }, 200);

  } catch (error: any) {
    console.error("Resend code error:", error);
    return c.json({ 
      error: error?.message || "Failed to resend code",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
};

export const verifyLoginCode = async (c: Context) => {
  try {
    const { email, code } = await handleJsonParseError(c);
    
    if (!email || !code) {
      return c.json({ error: "Email and code are required" }, 400);
    }

    const result = await verifyLogin(email, code) as AuthResponse;
    
    if (!result.success) {
      return c.json({ error: result.message }, 401);
    }

    if (!result.token) {
      throw new Error("Authentication token not generated");
    }

    return c.json({
      token: result.token,
      user: result.user
    }, 200);

  } catch (error: any) {
    console.error("Login verification error:", error);
    return c.json({ 
      error: error?.message || "Login verification failed",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
};

// Add to the bottom of auth.controller.ts

export const getUser = async (c: Context) => {
  try {
    const userId = parseInt(c.req.param('id'));
    if (isNaN(userId)) {
      return c.json({ error: "Invalid user ID" }, 400);
    }

    const result = await getUserById(userId);
    
    if (!result.success) {
      return c.json({ error: result.message }, 404);
    }

    return c.json({ user: result.user }, 200);
  } catch (error: any) {
    console.error("Get user error:", error);
    return c.json({ 
      error: error?.message || "Failed to fetch user",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
};

export const getUsers = async (c: Context) => {
  try {
    const result = await getAllUsers();
    
    if (!result.success) {
      return c.json({ error: result.message }, 400);
    }

    return c.json({ users: result.users }, 200);
  } catch (error: any) {
    console.error("Get users error:", error);
    return c.json({ 
      error: error?.message || "Failed to fetch users",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
};

export const update = async (c: Context) => {
  try {
    const userId = parseInt(c.req.param('id'));
    if (isNaN(userId)) {
      return c.json({ error: "Invalid user ID" }, 400);
    }

    const updateData = await handleJsonParseError(c);
    const result = await updateUser(userId, updateData);
    
    if (!result.success) {
      return c.json({ error: result.message }, 400);
    }

    return c.json({ 
      message: result.message || "User updated successfully",
      user: result.user 
    }, 200);
  } catch (error: any) {
    console.error("Update user error:", error);
    return c.json({ 
      error: error?.message || "Failed to update user",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
};

export const changePwd = async (c: Context) => {
  try {
    const userId = parseInt(c.req.param('id'));
    if (isNaN(userId)) {
      return c.json({ error: "Invalid user ID" }, 400);
    }

    const { currentPassword, newPassword } = await handleJsonParseError(c);
    const result = await changePassword(userId, currentPassword, newPassword);
    
    if (!result.success) {
      return c.json({ error: result.message }, 400);
    }

    return c.json({ 
      message: result.message || "Password changed successfully"
    }, 200);
  } catch (error: any) {
    console.error("Change password error:", error);
    return c.json({ 
      error: error?.message || "Failed to change password",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
};

export const removeUser = async (c: Context): Promise<Response> => {
  try {
    const userId = parseInt(c.req.param('id'));
    if (isNaN(userId)) {
      return c.json({ error: "Invalid user ID" }, 400);
    }

    const result = await deleteUser(userId);
    
    if (!result.success) {
      return c.json({ error: result.message }, 400);
    }

    return c.json({ 
      message: result.message || "User deleted successfully",
      user: result.user 
    }, 200);
  } catch (error: any) {
    console.error("Delete user error:", error);
    return c.json({ 
      error: error?.message || "Failed to delete user",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
};

export { deleteUser };
