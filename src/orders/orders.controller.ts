import { Context } from "hono";
import {
  getAllOrders,
  getOrdersByUser,
  getOrderById,
  createOrder,
  updateOrder,
  cancelOrder,
  getOrdersByStatus
} from "./orders.service";
import { orderSchema, orderUpdateSchema } from "./orders.validator";


// List all orders
export const listOrders = async (c: Context) => {
  try {
    const orders = await getAllOrders();
    return c.json(orders, 200);
  } catch (error) {
    return c.json({ error: "Failed to fetch orders" }, 500);
  }
};

// List orders by user
export const listUserOrders = async (c: Context) => {
  const userId = parseInt(c.req.param('userId'));
  if (isNaN(userId)) return c.json({ error: "Invalid user ID" }, 400);

  try {
    const orders = await getOrdersByUser(userId);
    return c.json(orders, 200);
  } catch (error) {
    return c.json({ error: "Failed to fetch orders" }, 500);
  }
};

export const getOrder = async (c: Context) => {
  const id = parseInt(c.req.param('id'));
  if (isNaN(id)) return c.json({ error: "Invalid order ID" }, 400);

  try {
    const order = await getOrderById(id);
    if (!order) return c.json({ error: "Order not found" }, 404);
    return c.json(order, 200);
  } catch (error) {
    return c.json({ error: "Failed to fetch order" }, 500);
  }
};

export const createNewOrder = async (c: Context) => {
  try {
    const data = await c.req.json();
    const validation = orderSchema.safeParse(data);
    if (!validation.success) {
      return c.json({ errors: validation.error.flatten() }, 400);
    }

    const orderData = { ...validation.data, totalAmount: String(validation.data.totalAmount) };
    const order = await createOrder(orderData);
    return c.json(order, 201);
  } catch (error) {
    return c.json({ error: "Failed to create order" }, 500);
  }
};

export const updateOrderStatus = async (c: Context) => {
  const id = parseInt(c.req.param('id'));
  if (isNaN(id)) return c.json({ error: "Invalid order ID" }, 400);

  try {
    const data = await c.req.json();
    const validation = orderUpdateSchema.safeParse(data);
    if (!validation.success) {
      return c.json({ errors: validation.error.flatten() }, 400);
    }

    const order = await updateOrder(id, validation.data);
    return c.json(order, 200);
  } catch (error) {
    return c.json({ error: "Failed to update order" }, 500);
  }
};

export const cancelUserOrder = async (c: Context) => {
  const id = parseInt(c.req.param('id'));
  if (isNaN(id)) return c.json({ error: "Invalid order ID" }, 400);

  try {
    const order = await cancelOrder(id);
    return c.json(order, 200);
  } catch (error) {
    return c.json({ error: "Failed to cancel order" }, 500);
  }
};

export const listOrdersByStatus = async (c: Context) => {
  const status = c.req.param('status');
  
  try {
    const orders = await getOrdersByStatus(status);
    return c.json(orders, 200);
  } catch (error) {
    return c.json({ error: "Failed to fetch orders" }, 500);
  }
};