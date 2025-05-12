import crypto from 'crypto';

// Generate M-Pesa password with validation
export const generateMpesaPassword = (shortCode: string, passkey: string, timestamp: string) => {
  if (!shortCode || !passkey || !timestamp) {
    throw new Error('Missing required parameters for M-Pesa password generation');
  }
  
  const passwordString = `${shortCode}${passkey}${timestamp}`;
  return Buffer.from(passwordString).toString('base64');
};

// Validate M-Pesa callback signature with enhanced security
export const validateMpesaCallback = (callbackData: any, signature: string) => {
  try {
    if (!callbackData || !signature) {
      return false;
    }

    const generatedSignature = crypto
      .createHash('sha256')
      .update(JSON.stringify(callbackData))
      .digest('hex');
      
    return crypto.timingSafeEqual(
      Buffer.from(generatedSignature),
      Buffer.from(signature)
    );
  } catch (error) {
    console.error('Error validating M-Pesa callback:', error);
    return false;
  }
};