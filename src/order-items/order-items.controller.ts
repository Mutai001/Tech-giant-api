import { Context } from "hono";
import {
  getOrderItemsByOrder,
  getOrderItemById,
  createOrderItem,
  updateOrderItem,
  deleteOrderItem,
  getOrderItemsByProduct,
  getAllOrderItems
} from "./order-items.service";
import { orderItemSchema, orderItemUpdateSchema } from "./order-items.validator";


//Get all order items
export const listAllOrderItems = async (c: Context) => {
  try {
    const items = await getAllOrderItems();
    return c.json(items, 200);
  } catch (error) {
    return c.json({ error: "Failed to fetch order items" }, 500);
  }
};

export const listOrderItems = async (c: Context) => {
  const orderId = parseInt(c.req.param('orderId'));
  if (isNaN(orderId)) return c.json({ error: "Invalid order ID" }, 400);

  try {
    const items = await getOrderItemsByOrder(orderId);
    return c.json(items, 200);
  } catch (error) {
    return c.json({ error: "Failed to fetch order items" }, 500);
  }
};

export const getOrderItem = async (c: Context) => {
  const id = parseInt(c.req.param('id'));
  if (isNaN(id)) return c.json({ error: "Invalid item ID" }, 400);

  try {
    const item = await getOrderItemById(id);
    if (!item) return c.json({ error: "Order item not found" }, 404);
    return c.json(item, 200);
  } catch (error) {
    return c.json({ error: "Failed to fetch order item" }, 500);
  }
};

export const createNewOrderItem = async (c: Context) => {
  try {
    const data = await c.req.json();
    const validation = orderItemSchema.safeParse(data);
    if (!validation.success) {
      return c.json({ errors: validation.error.flatten() }, 400);
    }

    const item = await createOrderItem({
      ...validation.data,
      priceAtPurchase: String(validation.data.priceAtPurchase),
      discountApplied: validation.data.discountApplied !== undefined && validation.data.discountApplied !== null
        ? String(validation.data.discountApplied)
        : validation.data.discountApplied
    });
    return c.json(item, 201);
  } catch (error) {
    return c.json({ error: "Failed to create order item" }, 500);
  }
};

export const updateExistingItem = async (c: Context) => {
  const id = parseInt(c.req.param('id'));
  if (isNaN(id)) return c.json({ error: "Invalid item ID" }, 400);

  try {
    const data = await c.req.json();
    const validation = orderItemUpdateSchema.safeParse(data);
    if (!validation.success) {
      return c.json({ errors: validation.error.flatten() }, 400);
    }

    const item = await updateOrderItem(id, {
      ...validation.data,
      discountApplied: validation.data.discountApplied !== undefined && validation.data.discountApplied !== null
        ? String(validation.data.discountApplied)
        : validation.data.discountApplied
    });
    return c.json(item, 200);
  } catch (error) {
    return c.json({ error: "Failed to update order item" }, 500);
  }
};

export const deleteItem = async (c: Context) => {
  const id = parseInt(c.req.param('id'));
  if (isNaN(id)) return c.json({ error: "Invalid item ID" }, 400);

  try {
    const item = await getOrderItemById(id);
    if (!item) return c.json({ error: "Order item not found" }, 404);

    const deleted = await deleteOrderItem(id);
    return c.json(deleted, 200);
  } catch (error) {
    return c.json({ error: "Failed to delete order item" }, 500);
  }
};

export const listItemsByProduct = async (c: Context) => {
  const productId = parseInt(c.req.param('productId'));
  if (isNaN(productId)) return c.json({ error: "Invalid product ID" }, 400);

  try {
    const items = await getOrderItemsByProduct(productId);
    return c.json(items, 200);
  } catch (error) {
    return c.json({ error: "Failed to fetch order items" }, 500);
  }
};