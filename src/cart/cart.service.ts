import { eq, and } from "drizzle-orm";
import db from "../drizzle/db";
import { cartItems } from "../drizzle/schema";
import type { CartItem, NewCartItem } from "../drizzle/schema";

export const getCartItemsByUser = async (userId: number): Promise<CartItem[]> => {
  return await db.select()
    .from(cartItems)
    .where(eq(cartItems.userId, userId))
    .orderBy(cartItems.createdAt);
};

export const getCartItemById = async (id: number): Promise<CartItem | null> => {
  const [item] = await db.select()
    .from(cartItems)
    .where(eq(cartItems.cartItemId, id));
  return item || null;
};

export const addToCart = async (cartData: NewCartItem): Promise<CartItem> => {
  // Check if item already exists in cart
  const [existing] = await db.select()
    .from(cartItems)
    .where(
      and(
        eq(cartItems.userId, cartData.userId),
        eq(cartItems.productId, cartData.productId)
      )
    );

  if (existing) {
    // Update quantity if exists
    const [updated] = await db.update(cartItems)
      .set({ 
        quantity: existing.quantity + cartData.quantity,
        updatedAt: new Date()
      })
      .where(eq(cartItems.cartItemId, existing.cartItemId))
      .returning();
    return updated;
  }

  // Create new if doesn't exist
  const [item] = await db.insert(cartItems)
    .values(cartData)
    .returning();
  return item;
};

export const updateCartItem = async (
  id: number,
  cartData: Partial<NewCartItem>
): Promise<CartItem> => {
  const [item] = await db.update(cartItems)
    .set({
      ...cartData,
      updatedAt: new Date()
    })
    .where(eq(cartItems.cartItemId, id))
    .returning();
  return item;
};

export const removeFromCart = async (id: number): Promise<CartItem> => {
  const [item] = await db.delete(cartItems)
    .where(eq(cartItems.cartItemId, id))
    .returning();
  return item;
};

export const clearUserCart = async (userId: number): Promise<void> => {
  await db.delete(cartItems)
    .where(eq(cartItems.userId, userId));
};