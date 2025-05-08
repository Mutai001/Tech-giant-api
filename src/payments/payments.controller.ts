import { Context } from "hono";
import {
  createPayment,
  getPaymentById,
  updatePayment,
  processMpesaPayment,
  getPaymentsByOrder,
  getPaymentsByUser,
  handleMpesaCallback
} from "./payments.service";
import { paymentSchema, mpesaPaymentSchema, paymentUpdateSchema } from "./payments.validator";

export const createNewPayment = async (c: Context) => {
  try {
    const data = await c.req.json();
    const validation = paymentSchema.safeParse(data);
    if (!validation.success) {
      return c.json({ errors: validation.error.flatten() }, 400);
    }

    const payment = await createPayment(validation.data);
    return c.json(payment, 201);
  } catch (error) {
    return c.json({ error: "Failed to create payment" }, 500);
  }
};

export const initiateMpesaPaymentHandler = async (c: Context) => {
  try {
    const data = await c.req.json();
    const validation = mpesaPaymentSchema.safeParse(data);
    if (!validation.success) {
      return c.json({ errors: validation.error.flatten() }, 400);
    }

    const payment = await processMpesaPayment(validation.data);
    return c.json(payment, 201);
  } catch (error) {
    return c.json({ error: "M-Pesa payment failed to initiate" }, 500);
  }
};

export const getPayment = async (c: Context) => {
  const id = parseInt(c.req.param('id'));
  if (isNaN(id)) return c.json({ error: "Invalid payment ID" }, 400);

  try {
    const payment = await getPaymentById(id);
    if (!payment) return c.json({ error: "Payment not found" }, 404);
    return c.json(payment, 200);
  } catch (error) {
    return c.json({ error: "Failed to fetch payment" }, 500);
  }
};

export const updatePaymentStatus = async (c: Context) => {
  const id = parseInt(c.req.param('id'));
  if (isNaN(id)) return c.json({ error: "Invalid payment ID" }, 400);

  try {
    const data = await c.req.json();
    const validation = paymentUpdateSchema.safeParse(data);
    if (!validation.success) {
      return c.json({ errors: validation.error.flatten() }, 400);
    }

    const payment = await updatePayment(id, validation.data);
    return c.json(payment, 200);
  } catch (error) {
    return c.json({ error: "Failed to update payment" }, 500);
  }
};

export const listOrderPayments = async (c: Context) => {
  const orderId = parseInt(c.req.param('orderId'));
  if (isNaN(orderId)) return c.json({ error: "Invalid order ID" }, 400);

  try {
    const payments = await getPaymentsByOrder(orderId);
    return c.json(payments, 200);
  } catch (error) {
    return c.json({ error: "Failed to fetch payments" }, 500);
  }
};

export const listUserPayments = async (c: Context) => {
  const userId = parseInt(c.req.param('userId'));
  if (isNaN(userId)) return c.json({ error: "Invalid user ID" }, 400);

  try {
    const payments = await getPaymentsByUser(userId);
    return c.json(payments, 200);
  } catch (error) {
    return c.json({ error: "Failed to fetch payments" }, 500);
  }
};

export const mpesaCallbackHandler = async (c: Context) => {
  try {
    const callbackData = await c.req.json();
    const updatedPayment = await handleMpesaCallback(callbackData);
    
    if (!updatedPayment) {
      return c.json({ error: "Payment not found" }, 404);
    }

    return c.json(updatedPayment, 200);
  } catch (error) {
    return c.json({ error: "Failed to process callback" }, 500);
  }
};