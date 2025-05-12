import { Context } from "hono";
import {
  createPayment,
  getAllPayments,
  getPaymentById,
  updatePayment,
  processMpesaPayment,
  getPaymentsByOrder,
  getPaymentsByUser,
  handleMpesaCallback
} from "./payments.service";
import { paymentSchema, mpesaPaymentSchema, paymentUpdateSchema } from "./payments.validator";

const parseJsonBody = async (c: Context) => {
  try {
    return await c.req.json();
  } catch (e) {
    throw new Error("Invalid JSON format in request body");
  }
};

export const createNewPayment = async (c: Context) => {
  try {
    const data = await parseJsonBody(c);
    const validation = paymentSchema.safeParse(data);
    
    if (!validation.success) {
      return c.json({ 
        success: false,
        error: "Validation failed",
        details: validation.error.flatten() 
      }, 400);
    }

    const payment = await createPayment({
      ...validation.data,
      amount: String(validation.data.amount),
      transactionCode: null
    });
    
    return c.json({ success: true, payment }, 201);
  } catch (error: any) {
    return c.json({ 
      success: false,
      error: error.message || "Failed to create payment" 
    }, 500);
  }
};

export const initiateMpesaPaymentHandler = async (c: Context) => {
  try {
    const data = await parseJsonBody(c);
    const validation = mpesaPaymentSchema.safeParse(data);
    
    if (!validation.success) {
      return c.json({
        success: false,
        error: "Validation failed",
        details: validation.error.flatten()
      }, 400);
    }

    const payment = await processMpesaPayment(validation.data);
    return c.json({ success: true, payment }, 201);
  } catch (error: any) {
    return c.json({
      success: false,
      error: error.message || "M-Pesa payment failed to initiate"
    }, 500);
  }
};


//Get all payments
export const getAllPaymentService = async (c: Context) => {
  try {
    const payments = await getAllPayments();
    return c.json({ 
      success: true,
      payments 
    }, 200);
  } catch (error: any) {
    return c.json({ 
      success: false,
      error: error.message || "Failed to fetch payments" 
    }, 500);
  }
}

export const getPayment = async (c: Context) => {
  const id = parseInt(c.req.param('id'));
  if (isNaN(id)) return c.json({ 
    success: false,
    error: "Invalid payment ID" 
  }, 400);

  try {
    const payment = await getPaymentById(id);
    if (!payment) return c.json({ 
      success: false,
      error: "Payment not found" 
    }, 404);
    
    return c.json({ 
      success: true,
      payment 
    }, 200);
  } catch (error: any) {
    return c.json({ 
      success: false,
      error: error.message || "Failed to fetch payment" 
    }, 500);
  }
};

export const updatePaymentStatus = async (c: Context) => {
  const id = parseInt(c.req.param('id'));
  if (isNaN(id)) return c.json({ 
    success: false,
    error: "Invalid payment ID" 
  }, 400);

  try {
    const data = await parseJsonBody(c);
    const validation = paymentUpdateSchema.safeParse(data);
    
    if (!validation.success) {
      return c.json({
        success: false,
        error: "Validation failed",
        details: validation.error.flatten()
      }, 400);
    }

    const payment = await updatePayment(id, validation.data);
    return c.json({ 
      success: true,
      payment 
    }, 200);
  } catch (error: any) {
    return c.json({ 
      success: false,
      error: error.message || "Failed to update payment" 
    }, 500);
  }
};

export const listOrderPayments = async (c: Context) => {
  const orderId = parseInt(c.req.param('orderId'));
  if (isNaN(orderId)) return c.json({ 
    success: false,
    error: "Invalid order ID" 
  }, 400);

  try {
    const payments = await getPaymentsByOrder(orderId);
    return c.json({ 
      success: true,
      payments 
    }, 200);
  } catch (error: any) {
    return c.json({ 
      success: false,
      error: error.message || "Failed to fetch payments" 
    }, 500);
  }
};

export const listUserPayments = async (c: Context) => {
  const userId = parseInt(c.req.param('userId'));
  if (isNaN(userId)) return c.json({ 
    success: false,
    error: "Invalid user ID" 
  }, 400);

  try {
    const payments = await getPaymentsByUser(userId);
    return c.json({ 
      success: true,
      payments 
    }, 200);
  } catch (error: any) {
    return c.json({ 
      success: false,
      error: error.message || "Failed to fetch payments" 
    }, 500);
  }
};

export const mpesaCallbackHandler = async (c: Context) => {
  try {
    const callbackData = await parseJsonBody(c);
    const updatedPayment = await handleMpesaCallback(callbackData);
    
    if (!updatedPayment) {
      return c.json({ 
        success: false,
        error: "Payment not found" 
      }, 404);
    }

    return c.json({ 
      success: true,
      payment: updatedPayment 
    }, 200);
  } catch (error: any) {
    console.error("Callback error:", error);
    return c.json({ 
      success: false,
      error: error.message || "Failed to process callback" 
    }, 500);
  }
};