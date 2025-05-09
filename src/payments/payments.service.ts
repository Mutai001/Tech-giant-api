import { eq, and } from "drizzle-orm";
import db from "../drizzle/db";
import { payments } from "../drizzle/schema";
import type { Payment, NewPayment } from "../drizzle/schema";
import { initiateMpesaPayment } from "../services/mpesa.service";

// Core payment operations
export const createPayment = async (paymentData: NewPayment): Promise<Payment> => {
  const [payment] = await db.insert(payments)
    .values({
      ...paymentData,
      createdAt: new Date()
    })
    .returning();
  return payment;
};

//Get all payments
export const getAllPayments = async (): Promise<Payment[]> => {
  return await db.select()
    .from(payments)
    .orderBy(payments.createdAt);
}

export const getPaymentById = async (id: number): Promise<Payment | null> => {
  const [payment] = await db.select()
    .from(payments)
    .where(eq(payments.paymentId, id));
  return payment || null;
};

export const updatePayment = async (
  id: number,
  paymentData: Omit<Partial<NewPayment>, 'createdAt' | 'updatedAt'> & { 
    updatedAt?: Date 
  }
): Promise<Payment> => {
  const [payment] = await db.update(payments)
    .set({
      ...paymentData
    })
    .where(eq(payments.paymentId, id))
    .returning();
  return payment;
};

// M-Pesa specific operations
export const processMpesaPayment = async (paymentData: {
  orderId: number;
  userId: number;
  amount: number;
  phoneNumber: string;
}): Promise<Payment> => {
  // Initiate M-Pesa request
  const mpesaResponse = await initiateMpesaPayment({
    phone: paymentData.phoneNumber,
    amount: paymentData.amount,
    orderId: paymentData.orderId.toString()
  });

  // Create payment record with proper typing
  const paymentValues: NewPayment = {
    orderId: paymentData.orderId,
    userId: paymentData.userId,
    method: "mpesa",
    amount: paymentData.amount.toString(), // Convert to string to match decimal type
    transactionCode: "", // Will be updated when payment completes
    status: "pending",
    phoneNumber: paymentData.phoneNumber,
    merchantRequestId: mpesaResponse.MerchantRequestID,
    checkoutRequestId: mpesaResponse.CheckoutRequestID,
    paidAt: null,
    createdAt: new Date()
  };

  const [payment] = await db.insert(payments)
    .values(paymentValues)
    .returning();

  return payment;
};

// Query operations
export const getPaymentsByOrder = async (orderId: number): Promise<Payment[]> => {
  return await db.select()
    .from(payments)
    .where(eq(payments.orderId, orderId))
    .orderBy(payments.createdAt);
};

export const getPaymentsByUser = async (userId: number): Promise<Payment[]> => {
  return await db.select()
    .from(payments)
    .where(eq(payments.userId, userId))
    .orderBy(payments.createdAt);
};

// Webhook handler
export const handleMpesaCallback = async (callbackData: {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResultCode: number;
  ResultDesc: string;
  MpesaReceiptNumber?: string;
}): Promise<Payment | null> => {
  const payment = await db.query.payments.findFirst({
    where: and(
      eq(payments.merchantRequestId, callbackData.MerchantRequestID),
      eq(payments.checkoutRequestId, callbackData.CheckoutRequestID)
    )
  });

  if (!payment) return null;

  const status = callbackData.ResultCode === 0 ? "completed" : "failed";
  const updateData: Partial<NewPayment> = {
    status,
    transactionCode: callbackData.MpesaReceiptNumber || "",
    paidAt: status === "completed" ? new Date() : null
  };

  return await updatePayment(payment.paymentId, updateData);
};

// Additional utility functions
export const getPendingPayments = async (): Promise<Payment[]> => {
  return await db.select()
    .from(payments)
    .where(eq(payments.status, "pending"))
    .orderBy(payments.createdAt);
};

export const verifyPaymentStatus = async (paymentId: number): Promise<Payment> => {
  const payment = await getPaymentById(paymentId);
  if (!payment) {
    throw new Error("Payment not found");
  }

  if (payment.method === "mpesa" && payment.status === "pending" && payment.checkoutRequestId) {
    // Additional verification logic for M-Pesa payments
    // This would call Safaricom's API to verify the payment status
    // and update the payment record accordingly
  }

  return payment;
};