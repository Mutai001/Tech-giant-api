import { eq, and } from "drizzle-orm";
import db from "../drizzle/db";
import { orderItems, OrderItem, NewOrderItem } from "../drizzle/schema";

export const getOrderItemsByOrder = async (orderId: number): Promise<OrderItem[]> => {
  return await db.select()
    .from(orderItems)
    .where(eq(orderItems.orderId, orderId));
};

export const getOrderItemById = async (id: number): Promise<OrderItem | null> => {
  const [item] = await db.select()
    .from(orderItems)
    .where(eq(orderItems.itemId, id));
  return item || null;
};

export const createOrderItem = async (itemData: NewOrderItem): Promise<OrderItem> => {
  const [item] = await db.insert(orderItems)
    .values(itemData)
    .returning();
  return item;
};

export const updateOrderItem = async (
  id: number,
  itemData: Partial<NewOrderItem>
): Promise<OrderItem> => {
  const [item] = await db.update(orderItems)
    .set(itemData)
    .where(eq(orderItems.itemId, id))
    .returning();
  return item;
};

export const deleteOrderItem = async (id: number): Promise<OrderItem> => {
  const [item] = await db.delete(orderItems)
    .where(eq(orderItems.itemId, id))
    .returning();
  return item;
};

export const getOrderItemsByProduct = async (productId: number): Promise<OrderItem[]> => {
  return await db.select()
    .from(orderItems)
    .where(eq(orderItems.productId, productId));
};