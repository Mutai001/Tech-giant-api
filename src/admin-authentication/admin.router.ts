import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { registerAdmin } from './admin.controller';
import { registerAdminSchema } from './validator';

export const adminRouter = new Hono();

adminRouter.post('/register', 
    zValidator('json', registerAdminSchema, (result, c) => {
        if (!result.success) {
            return c.json(result.error.issues, 400);
        }
    }), 
    registerAdmin
);