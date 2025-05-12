import axios from 'axios';
import { generateMpesaPassword } from '../utils/mpesa-utils';
import db from '../drizzle/db';
import { payments } from '../drizzle/schema';
import { eq } from 'drizzle-orm';

// Enhanced M-Pesa configuration with timeout and retry settings
const MPESA_CONFIG = {
  BUSINESS_SHORT_CODE: process.env.MPESA_BUSINESS_SHORT_CODE || '',
  PASSKEY: process.env.MPESA_PASSKEY || '',
  CONSUMER_KEY: process.env.MPESA_CONSUMER_KEY || '',
  CONSUMER_SECRET: process.env.MPESA_CONSUMER_SECRET || '',
  CALLBACK_URL: process.env.MPESA_CALLBACK_URL || '',
  TRANSACTION_TYPE: 'CustomerPayBillOnline',
  ENVIRONMENT: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
  API_TIMEOUT: parseInt(process.env.MPESA_API_TIMEOUT || '10000'),
  MAX_RETRIES: parseInt(process.env.MPESA_MAX_RETRIES || '3')
};

// Configure axios instance with timeout and retry
const mpesaAxios = axios.create({
  timeout: MPESA_CONFIG.API_TIMEOUT,
  maxRedirects: 0
});

// Generate access token with retry logic
const generateAccessToken = async (retryCount = 0): Promise<string> => {
  try {
    const auth = Buffer.from(`${MPESA_CONFIG.CONSUMER_KEY}:${MPESA_CONFIG.CONSUMER_SECRET}`).toString('base64');
    const url = `https://${MPESA_CONFIG.ENVIRONMENT}.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials`;
    
    const response = await mpesaAxios.get(url, {
      headers: {
        Authorization: `Basic ${auth}`,
        'Cache-Control': 'no-cache'
      }
    });

    if (!response.data.access_token) {
      throw new Error('No access token received');
    }

    return response.data.access_token;
  } catch (error) {
    if (retryCount < MPESA_CONFIG.MAX_RETRIES) {
      console.warn(`Retrying token generation (attempt ${retryCount + 1})`);
      return generateAccessToken(retryCount + 1);
    }
    console.error('Failed to generate M-Pesa access token after retries:', error);
    throw new Error('Failed to generate M-Pesa access token. Please check your internet connection and API credentials.');
  }
};

// Initiate M-Pesa STK push with enhanced error handling
export const initiateMpesaPayment = async (paymentDetails: {
  phone: string;
  amount: number;
  orderId: string;
}) => {
  try {
    const accessToken = await generateAccessToken();
    const timestamp = new Date().toISOString().replace(/[-:.]/g, '').slice(0, -5);
    const password = generateMpesaPassword(
      MPESA_CONFIG.BUSINESS_SHORT_CODE,
      MPESA_CONFIG.PASSKEY,
      timestamp
    );

    // Format phone number with validation
    let formattedPhone = paymentDetails.phone;
    if (!formattedPhone.startsWith('254')) {
      if (formattedPhone.startsWith('0')) {
        formattedPhone = `254${formattedPhone.substring(1)}`;
      } else if (formattedPhone.startsWith('+254')) {
        formattedPhone = formattedPhone.substring(1);
      } else {
        throw new Error('Invalid phone number format. Use 254... or 0...');
      }
    }

    if (formattedPhone.length !== 12) {
      throw new Error('Phone number must be 12 digits after formatting (254...)');
    }

    const requestData = {
      BusinessShortCode: MPESA_CONFIG.BUSINESS_SHORT_CODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: MPESA_CONFIG.TRANSACTION_TYPE,
      Amount: paymentDetails.amount,
      PartyA: formattedPhone,
      PartyB: MPESA_CONFIG.BUSINESS_SHORT_CODE,
      PhoneNumber: formattedPhone,
      CallBackURL: MPESA_CONFIG.CALLBACK_URL,
      AccountReference: `Order${paymentDetails.orderId}`,
      TransactionDesc: `Payment for order ${paymentDetails.orderId}`
    };

    const response = await mpesaAxios.post(
      `https://${MPESA_CONFIG.ENVIRONMENT}.safaricom.co.ke/mpesa/stkpush/v1/processrequest`,
      requestData,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.ResponseCode !== '0') {
      throw new Error(response.data.ResponseDescription || 'M-Pesa request failed');
    }

    return {
      MerchantRequestID: response.data.MerchantRequestID,
      CheckoutRequestID: response.data.CheckoutRequestID,
      ResponseCode: response.data.ResponseCode,
      ResponseDescription: response.data.ResponseDescription
    };
  } catch (error: any) {
    console.error('Error initiating M-Pesa payment:', error);
    throw new Error(
      error.response?.data?.errorMessage ||
      error.message ||
      'Failed to initiate M-Pesa payment. Please try again later.'
    );
  }
};

// Verify payment status with retry logic
export const verifyMpesaPayment = async (checkoutRequestId: string, retryCount = 0): Promise<any> => {
  try {
    const accessToken = await generateAccessToken();
    const timestamp = new Date().toISOString().replace(/[-:.]/g, '').slice(0, -5);
    const password = generateMpesaPassword(
      MPESA_CONFIG.BUSINESS_SHORT_CODE,
      MPESA_CONFIG.PASSKEY,
      timestamp
    );

    const response = await mpesaAxios.post(
      `https://${MPESA_CONFIG.ENVIRONMENT}.safaricom.co.ke/mpesa/stkpushquery/v1/query`,
      {
        BusinessShortCode: MPESA_CONFIG.BUSINESS_SHORT_CODE,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: checkoutRequestId
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  } catch (error) {
    if (retryCount < MPESA_CONFIG.MAX_RETRIES) {
      console.warn(`Retrying payment verification (attempt ${retryCount + 1})`);
      return verifyMpesaPayment(checkoutRequestId, retryCount + 1);
    }
    console.error('Error verifying M-Pesa payment:', error);
    throw new Error('Failed to verify M-Pesa payment after retries');
  }
};

// Handle M-Pesa webhook with validation
export const handleMpesaWebhook = async (webhookData: any) => {
  try {
    if (!webhookData.CheckoutRequestID) {
      throw new Error('Invalid callback data: Missing CheckoutRequestID');
    }

    const result = await db.update(payments)
      .set({
        status: webhookData.ResultCode === '0' ? 'completed' : 'failed',
        transactionCode: webhookData.MpesaReceiptNumber || null,
        paidAt: webhookData.ResultCode === '0' ? new Date() : null,
        updatedAt: new Date()
      })
      .where(eq(payments.checkoutRequestId, webhookData.CheckoutRequestID))
      .returning();

    if (!result[0]) {
      throw new Error('Payment record not found for this callback');
    }

    return result[0];
  } catch (error) {
    console.error('Error processing M-Pesa webhook:', error);
    throw new Error('Failed to process M-Pesa webhook');
  }
};