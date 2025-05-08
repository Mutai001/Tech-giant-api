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

const validationErrorHandler = (result: any, c: any) => {
  if (!result.success) {
    return c.json({
      error: "Validation failed",
      details: result.error.issues.map((issue: any) => ({
        field: issue.path.join('.'),
        message: issue.message
      }))
    }, 400);
  }
};

authRouter.post('/register', 
  zValidator('json', registerSchema, validationErrorHandler), 
  register
);

authRouter.post('/verify', 
  zValidator('json', verifyEmailSchema, validationErrorHandler), 
  verify
);

authRouter.post('/resend-code', 
  zValidator('json', resendVerificationSchema, validationErrorHandler), 
  resendCode
);

authRouter.post('/login', 
  zValidator('json', loginSchema, validationErrorHandler), 
  login
);

authRouter.post('/login/verify', 
  zValidator('json', loginVerificationSchema, validationErrorHandler), 
  verifyLoginCode
);