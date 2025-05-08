import { Context } from "hono";
import { 
  registerUser, 
  loginUser, 
  verifyEmail, 
  resendVerificationCode,
  verifyLogin
} from "./auth.service";
import { 
  registerSchema, 
  loginSchema, 
  verifyEmailSchema,
  resendVerificationSchema,
  loginVerificationSchema
} from "./auth.validator";

export const register = async (c: Context) => {
  try {
    const userData = await c.req.json();
    const result = await registerUser(userData);
    
    if (!result.success) {
      return c.json({ error: result.message }, 400);
    }

    return c.json({ 
      message: result.message,
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
    const credentials = await c.req.json();
    const result = await loginUser(credentials);
    
    if (!result.success) {
      if (result.requiresVerification) {
        return c.json({ 
          requiresVerification: true,
          message: result.message 
        }, 401);
      }
      return c.json({ error: result.message }, 401);
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
    const { email, code } = await c.req.json();
    const result = await verifyEmail(email, code);
    
    if (!result.success) {
      return c.json({ error: result.message }, 400);
    }

    return c.json({ 
      message: result.message,
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
    const { email } = await c.req.json();
    const result = await resendVerificationCode(email);
    
    if (!result.success) {
      return c.json({ error: result.message }, 400);
    }

    return c.json({ 
      message: result.message
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
    const { email, code } = await c.req.json();
    const result = await verifyLogin(email, code);
    
    if (!result.success) {
      return c.json({ error: result.message }, 401);
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