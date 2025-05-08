import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { registerAdmin, loginAdmin } from './admin.controller';
import { registerAdminSchema, loginAdminSchema } from './validator';

export const adminRouter = new Hono();

// Admin Registration
adminRouter.post('/register', 
    zValidator('json', registerAdminSchema, (result, c) => {
        if (!result.success) {
            return c.json(result.error.issues, 400);
        }
    }), 
    registerAdmin
);

// Admin Login
adminRouter.post('/login', 
    zValidator('json', loginAdminSchema, (result, c) => {
        if (!result.success) {
            return c.json(result.error.issues, 400);
        }
    }), 
    loginAdmin
);