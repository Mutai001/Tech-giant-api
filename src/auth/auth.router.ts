import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { 
  register, 
  login, 
  verify, 
  resendCode,
  verifyLoginCode
} from './auth.controller';
import { 
  registerSchema, 
  loginSchema, 
  verifyEmailSchema,
  resendVerificationSchema,
  loginVerificationSchema
} from './auth.validator';

export const authRouter = new Hono();

// User Registration
authRouter.post('/register', 
  zValidator('json', registerSchema, (result, c) => {
    if (!result.success) {
      return c.json(result.error.issues, 400);
    }
  }), 
  register
);

// Email Verification
authRouter.post('/verify', 
  zValidator('json', verifyEmailSchema, (result, c) => {
    if (!result.success) {
      return c.json(result.error.issues, 400);
    }
  }), 
  verify
);

// Resend Verification Code
authRouter.post('/resend-code', 
  zValidator('json', resendVerificationSchema, (result, c) => {
    if (!result.success) {
      return c.json(result.error.issues, 400);
    }
  }), 
  resendCode
);

// Login
authRouter.post('/login', 
  zValidator('json', loginSchema, (result, c) => {
    if (!result.success) {
      return c.json(result.error.issues, 400);
    }
  }), 
  login
);

// Login with Verification Code
authRouter.post('/login/verify', 
  zValidator('json', loginVerificationSchema, (result, c) => {
    if (!result.success) {
      return c.json(result.error.issues, 400);
    }
  }), 
  verifyLoginCode
);