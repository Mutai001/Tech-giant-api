import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { 
  register, 
  login, 
  verify, 
  resendCode,
  // verifyLoginCode,
  getUsers,
  changePwd,
  removeUser,
  getUser,
  update
} from './auth.controller';
import { 
  registerSchema, 
  loginSchema, 
  verifyEmailSchema,
  resendVerificationSchema,
  loginVerificationSchema,
  changePasswordSchema,
  updateUserSchema
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

// authRouter.post('/login/verify', 
//   zValidator('json', loginVerificationSchema, validationErrorHandler), 
//   verifyLoginCode
// );

// Add to the bottom of auth.router.ts

// User CRUD routes
authRouter.get('/users', getUsers);
authRouter.get('/users/:id', getUser);
authRouter.patch('/users/:id', 
  zValidator('json', updateUserSchema, validationErrorHandler),
  update
);
authRouter.patch('/users/:id/change-password',
  zValidator('json', changePasswordSchema, validationErrorHandler),
  changePwd
);
authRouter.delete('/users/:id', removeUser);