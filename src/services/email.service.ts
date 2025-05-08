import { Resend } from 'resend'; // Or any other email service you prefer
import { renderVerificationEmail } from '../templates/verification-email';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendVerificationEmail = async (email: string, code: string) => {
  try {
    // In production, use a proper email template
    const htmlContent = renderVerificationEmail(code);
    
    await resend.emails.send({
      from: 'no-reply@yourdomain.com',
      to: email,
      subject: 'Your Verification Code',
      html: htmlContent,
    });
    
    console.log(`Verification email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw new Error('Failed to send verification email');
  }
};

// For login verification (you can customize this differently if needed)
export const sendLoginVerificationEmail = async (email: string, code: string) => {
  try {
    const htmlContent = renderVerificationEmail(code, true);
    
    await resend.emails.send({
      from: 'no-reply@yourdomain.com',
      to: email,
      subject: 'Your Login Verification Code',
      html: htmlContent,
    });
    
    console.log(`Login verification email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending login verification email:', error);
    throw new Error('Failed to send login verification email');
  }
};