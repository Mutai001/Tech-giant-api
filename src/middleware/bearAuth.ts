import { Context, Next } from 'hono';
import { verify } from 'hono/jwt';
import { getCookie } from 'hono/cookie';
import { admins } from '../drizzle/schema';
import { eq } from 'drizzle-orm';
import db from '../drizzle/db';
import { config } from '../config';

export const adminRoleAuth = async (c: Context, next: Next) => {
    try {
        // 1. Get token from Authorization header or cookie
        const authHeader = c.req.header('Authorization');
        let token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
        
        if (!token) {
            token = getCookie(c, 'admin_token') ?? null;
        }

        console.log('Token received:', token); // Debug log

        if (!token) {
            return c.json({ error: 'Unauthorized - No token provided' }, 401);
        }

        // 2. Verify JWT token
        if (!config.jwtSecret) {
            throw new Error('JWT secret is not configured');
        }
        const payload = await verify(token, config.jwtSecret);
        console.log('Token payload:', payload); // Debug log

        if (!payload.sub || !payload.role || payload.role !== 'admin') {
            return c.json({ error: 'Invalid token payload' }, 401);
        }

        // 3. Check if admin exists in database
        const [admin] = await db.select()
            .from(admins)
            .where(eq(admins.adminId, Number(payload.sub)));

        if (!admin) {
            return c.json({ error: 'Admin not found' }, 401);
        }

        // 4. Proceed to next middleware/route
        await next();
    } catch (error) {
        console.error('Authentication error:', error);
        return c.json({ 
            error: 'Unauthorized - Invalid token',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, 401);
    }
};