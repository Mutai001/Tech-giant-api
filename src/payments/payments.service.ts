import { eq, and } from "drizzle-orm";
import db from "../drizzle/db";
import { payments, Payment, NewPayment } from "../drizzle/schema";
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

export const getPaymentById = async (id: number): Promise<Payment | null> => {
  const [payment] = await db.select()
    .from(payments)
    .where(eq(payments.paymentId, id));
  return payment || null;
};

export const updatePayment = async (
  id: number,
  paymentData: Partial<NewPayment>
): Promise<Payment> => {
  const [payment] = await db.update(payments)
    .set(paymentData)
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

  // Create payment record
  const [payment] = await db.insert(payments)
    .values({
      orderId: paymentData.orderId,
      userId: paymentData.userId,
      method: "mpesa",
      amount: paymentData.amount,
      phoneNumber: paymentData.phoneNumber,
      merchantRequestId: mpesaResponse.MerchantRequestID,
      checkoutRequestId: mpesaResponse.CheckoutRequestID,
      status: "pending",
      createdAt: new Date()
    })
    .returning();

  return payment;
};

// Query operations
export const getPaymentsByOrder = async (orderId: number): Promise<Payment[]> => {
  return await db.select()
    .from(payments)
    .where(eq(payments.orderId, orderId));
};

export const getPaymentsByUser = async (userId: number): Promise<Payment[]> => {
  return await db.select()
    .from(payments)
    .where(eq(payments.userId, userId));
};

// Webhook handler
export const handleMpesaCallback = async (callbackData: {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResultCode: number;
  ResultDesc: string;
  MpesaReceiptNumber?: string;
}) => {
  const payment = await db.query.payments.findFirst({
    where: and(
      eq(payments.merchantRequestId, callbackData.MerchantRequestID),
      eq(payments.checkoutRequestId, callbackData.CheckoutRequestID)
    )
  });

  if (!payment) return null;

  const status = callbackData.ResultCode === 0 ? "completed" : "failed";
  const updateData = {
    status,
    transactionCode: callbackData.MpesaReceiptNumber,
    paidAt: status === "completed" ? new Date() : undefined
  };

  return await updatePayment(payment.paymentId, updateData);
};