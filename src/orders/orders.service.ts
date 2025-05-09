import { eq, and } from "drizzle-orm";
import db from "../drizzle/db";
import { orders, Order, NewOrder } from "../drizzle/schema";

//Get all orders
export const getAllOrders = async (): Promise<Order[]> => {
  return await db.select()
    .from(orders)
    .orderBy(orders.createdAt);
};

//Get orders by user
export const getOrdersByUser = async (userId: number): Promise<Order[]> => {
  return await db.select()
    .from(orders)
    .where(eq(orders.userId, userId))
    .orderBy(orders.createdAt);
};

export const getOrderById = async (id: number): Promise<Order | null> => {
  const [order] = await db.select()
    .from(orders)
    .where(eq(orders.orderId, id));
  return order || null;
};

export const createOrder = async (orderData: NewOrder): Promise<Order> => {
  const [order] = await db.insert(orders)
    .values({
      ...orderData,
      createdAt: new Date(),
      updatedAt: new Date()
    })
    .returning();
  return order;
};

export const updateOrder = async (
  id: number,
  orderData: Partial<NewOrder>
): Promise<Order> => {
  const [order] = await db.update(orders)
    .set({
      ...orderData,
      updatedAt: new Date()
    })
    .where(eq(orders.orderId, id))
    .returning();
  return order;
};

export const cancelOrder = async (id: number): Promise<Order> => {
  const [order] = await db.update(orders)
    .set({
      status: "cancelled",
      updatedAt: new Date()
    })
    .where(eq(orders.orderId, id))
    .returning();
  return order;
};

export const getOrdersByStatus = async (status: string): Promise<Order[]> => {
  return await db.select()
    .from(orders)
    .where(eq(orders.status, status))
    .orderBy(orders.createdAt);
};