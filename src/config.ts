import 'dotenv/config';

export const config = {
    jwtSecret: process.env.JWT_SECRET,
    jwtIssuer: process.env.JWT_ISSUER || 'your-app-name',
    // other configs...
};

if (!config.jwtSecret) {
    throw new Error('JWT_SECRET is not configured in environment variables');
}