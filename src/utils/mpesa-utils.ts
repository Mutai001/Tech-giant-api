import crypto from 'crypto';

// Generate M-Pesa password
export const generateMpesaPassword = (shortCode: string, passkey: string, timestamp: string) => {
  const passwordString = `${shortCode}${passkey}${timestamp}`;
  return Buffer.from(passwordString).toString('base64');
};

// Validate M-Pesa callback signature
export const validateMpesaCallback = (callbackData: any, signature: string) => {
  const generatedSignature = crypto
    .createHash('sha256')
    .update(JSON.stringify(callbackData))
    .digest('hex');
  return generatedSignature === signature;
};