import { eq, and, sql } from "drizzle-orm";
import db from "../drizzle/db";
import { orders, Order, NewOrder, orderItems, products } from "../drizzle/schema";

export const getAllOrders = async (): Promise<Order[]> => {
  return await db.query.orders.findMany({
    orderBy: (orders, { asc }) => [asc(orders.createdAt)],
    with: {
      items: {
        with: {
          product: true
        }
      },
      user: {
        columns: {
          userId: true,
          fullName: true,
          email: true
        }
      }
    }
  });
};

export const getOrdersByUser = async (userId: number): Promise<Order[]> => {
  return await db.query.orders.findMany({
    where: eq(orders.userId, userId),
    orderBy: (orders, { asc }) => [asc(orders.createdAt)],
    with: {
      items: {
        with: {
          product: true
        }
      }
    }
  });
};

export const getOrderById = async (id: number): Promise<(Order & {
  items: any[];
  user: { userId: number; fullName: string; email: string };
}) | null> => {
  const order = await db.query.orders.findFirst({
    where: eq(orders.orderId, id),
    with: {
      items: {
        with: {
          product: true
        }
      },
      user: {
        columns: {
          userId: true,
          fullName: true,
          email: true
        }
      }
    }
  });
  return order ?? null;
};

export const createOrder = async (orderData: NewOrder & { items: any[] }): Promise<Order> => {
  return await db.transaction(async (tx) => {
    // Create the order
    const [order] = await tx.insert(orders)
      .values({
        userId: orderData.userId,
        status: orderData.status,
        totalAmount: String(orderData.totalAmount),
        paymentStatus: orderData.paymentStatus,
        shippingAddress: orderData.shippingAddress,
        contactPhone: orderData.contactPhone,
        trackingNumber: orderData.trackingNumber,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();

    // Create order items and update product quantities
    for (const item of orderData.items) {
      // Verify product exists and has sufficient stock
      const product = await tx.query.products.findFirst({
        where: eq(products.productId, item.productId)
      });

      if (!product) throw new Error(`Product ${item.productId} not found`);
      if (product.stockLeft < item.quantity) {
        throw new Error(`Insufficient stock for product ${product.name}`);
      }

      // Create order item
      await tx.insert(orderItems).values({
        orderId: order.orderId,
        productId: item.productId,
        quantity: item.quantity,
        priceAtPurchase: String(item.priceAtPurchase),
        discountApplied: String(item.discountApplied || 0)
      });

      // Update product stock
      await tx.update(products)
        .set({ stockLeft: product.stockLeft - item.quantity })
        .where(eq(products.productId, item.productId));
    }

    return order;
  });
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
  return await db.transaction(async (tx) => {
    // Get order items first
    const items = await tx.query.orderItems.findMany({
      where: eq(orderItems.orderId, id)
    });

    // Restore product quantities
    for (const item of items) {
      await tx.update(products)
        .set({ 
          stockLeft: sql`${products.stockLeft} + ${item.quantity}`
        })
        .where(eq(products.productId, item.productId));
    }

    // Update order status
    const [order] = await tx.update(orders)
      .set({
        status: "cancelled",
        updatedAt: new Date()
      })
      .where(eq(orders.orderId, id))
      .returning();

    return order;
  });
};

export const getOrdersByStatus = async (status: string): Promise<Order[]> => {
  return await db.query.orders.findMany({
    where: eq(orders.status, status),
    orderBy: (orders, { asc }) => [asc(orders.createdAt)],
    with: {
      items: {
        with: {
          product: true
        }
      }
    }
  });
};