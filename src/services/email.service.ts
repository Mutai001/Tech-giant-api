import { Resend } from 'resend';
import { renderVerificationEmail } from '../templates/verification-email';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendVerificationEmail = async (email: string, code: string, isLogin: boolean = false) => {
  try {
    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error("Invalid email format");
    }

    // Check if Resend is configured
    if (!process.env.RESEND_API_KEY) {
      throw new Error("Email service not configured - missing RESEND_API_KEY");
    }

    const htmlContent = renderVerificationEmail(code, isLogin);
    
    const { error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'no-reply@yourdomain.com',
      to: email,
      subject: isLogin ? 'Your Login Verification Code' : 'Your Verification Code',
      html: htmlContent,
    });

    if (error) {
      console.error('Resend API error:', error);
      throw new Error(`Email service error: ${error.message}`);
    }

    console.log(`Verification email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error;
  }
};