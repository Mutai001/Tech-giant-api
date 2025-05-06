import { Context, Next } from 'hono';
import { verify } from 'hono/jwt';
import { getCookie } from 'hono/cookie';
import { admins } from '../drizzle/schema';
import { eq } from 'drizzle-orm';
import db from '../drizzle/db';
import { config } from '../config';

export const adminRoleAuth = async (c: Context, next: Next) => {
    try {
        // 1. Get token from headers or cookies
        const authHeader = c.req.header('Authorization');
        let token = authHeader?.split(' ')[1]; // Get token after 'Bearer '
        
        if (!token) {
            token = getCookie(c, 'admin_token');
        }

        console.log('Token extraction:', { 
            authHeader: c.req.header('Authorization'),
            tokenFound: !!token
        });

        if (!token) {
            return c.json({ 
                error: 'Unauthorized - No token provided',
                receivedHeaders: c.req.raw.headers
            }, 401);
        }

        // 2. Verify token
        let payload;
        try {
            payload = await verify(token, config.jwtSecret as string);
            console.log('Token payload:', payload);
        } catch (verifyError) {
            console.error('Token verification failed:', verifyError);
            return c.json({ error: 'Unauthorized - Invalid token', details: verifyError instanceof Error ? verifyError.message : 'Unknown verification error' }, 401);
        }

        if (!payload.sub || payload.role !== 'admin') {
            return c.json({ error: 'Invalid token payload' }, 401);
        }

        // 3. Verify admin exists
        const [admin] = await db.select()
            .from(admins)
            .where(eq(admins.adminId, Number(payload.sub)));

        if (!admin) {
            return c.json({ error: 'Admin not found' }, 401);
        }

        // 4. Attach admin to context
        c.set('admin', {
            adminId: admin.adminId,
            email: admin.email,
            fullName: admin.fullName
        });

        await next();
    } catch (error) {
        console.error('Auth error:', error);
        return c.json({ 
            error: 'Unauthorized - Invalid token',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, 401);
    }
};