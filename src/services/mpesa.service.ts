import axios from 'axios';
import { generateMpesaPassword } from '../utils/mpesa-utils';
import db from '../drizzle/db';
import { payments } from '../drizzle/schema';
import { eq } from 'drizzle-orm';

// M-Pesa configuration (should be in your .env)
const MPESA_CONFIG = {
  BUSINESS_SHORT_CODE: process.env.MPESA_BUSINESS_SHORT_CODE || '',
  PASSKEY: process.env.MPESA_PASSKEY || '',
  CONSUMER_KEY: process.env.MPESA_CONSUMER_KEY || '',
  CONSUMER_SECRET: process.env.MPESA_CONSUMER_SECRET || '',
  CALLBACK_URL: process.env.MPESA_CALLBACK_URL || '',
  TRANSACTION_TYPE: 'CustomerPayBillOnline',
  ENVIRONMENT: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox'
};

// Generate access token
const generateAccessToken = async () => {
  try {
    const auth = Buffer.from(`${MPESA_CONFIG.CONSUMER_KEY}:${MPESA_CONFIG.CONSUMER_SECRET}`).toString('base64');
    const response = await axios.get(
      `https://${MPESA_CONFIG.ENVIRONMENT === 'production' ? 'api' : 'sandbox'}.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials`,
      {
        headers: {
          Authorization: `Basic ${auth}`
        }
      }
    );
    return response.data.access_token;
  } catch (error) {
    console.error('Error generating M-Pesa access token:', error);
    throw new Error('Failed to generate M-Pesa access token');
  }
};

// Initiate M-Pesa STK push
export const initiateMpesaPayment = async (paymentDetails: {
  phone: string;
  amount: number;
  orderId: string;
}) => {
  try {
    const accessToken = await generateAccessToken();
    const timestamp = new Date().toISOString().replace(/[-:.]/g, '').slice(0, -5);
    const password = generateMpesaPassword(MPESA_CONFIG.BUSINESS_SHORT_CODE, MPESA_CONFIG.PASSKEY, timestamp);

    // Format phone number (ensure it starts with 254)
    const formattedPhone = paymentDetails.phone.startsWith('254')
      ? paymentDetails.phone
      : `254${paymentDetails.phone.slice(-9)}`;

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

    const response = await axios.post(
      `https://${MPESA_CONFIG.ENVIRONMENT === 'production' ? 'api' : 'sandbox'}.safaricom.co.ke/mpesa/stkpush/v1/processrequest`,
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
  } catch (error) {
    console.error('Error initiating M-Pesa payment:', error);
    throw new Error('Failed to initiate M-Pesa payment');
  }
};

// Verify payment status
export const verifyMpesaPayment = async (checkoutRequestId: string) => {
  try {
    const accessToken = await generateAccessToken();
    const timestamp = new Date().toISOString().replace(/[-:.]/g, '').slice(0, -5);
    const password = generateMpesaPassword(MPESA_CONFIG.BUSINESS_SHORT_CODE, MPESA_CONFIG.PASSKEY, timestamp);

    const response = await axios.post(
      `https://${MPESA_CONFIG.ENVIRONMENT === 'production' ? 'api' : 'sandbox'}.safaricom.co.ke/mpesa/stkpushquery/v1/query`,
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
    console.error('Error verifying M-Pesa payment:', error);
    throw new Error('Failed to verify M-Pesa payment');
  }
};

// Handle M-Pesa webhook
export const handleMpesaWebhook = async (webhookData: any) => {
  try {
    // Update payment status in database
    const result = await db.update(payments)
      .set({
        status: webhookData.ResultCode === '0' ? 'completed' : 'failed',
        transactionCode: webhookData.MpesaReceiptNumber,
        paidAt: webhookData.ResultCode === '0' ? new Date() : undefined
      })
      .where(eq(payments.checkoutRequestId, webhookData.CheckoutRequestID))
      .returning();

    return result[0];
  } catch (error) {
    console.error('Error processing M-Pesa webhook:', error);
    throw new Error('Failed to process M-Pesa webhook');
  }
};