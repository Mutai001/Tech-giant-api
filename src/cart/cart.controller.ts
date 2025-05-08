import { Context } from "hono";
import {
  getCartItemsByUser,
  getCartItemById,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearUserCart
} from "./cart.service";
import { cartItemSchema, cartItemUpdateSchema } from "./cart.validator";

export const getUserCart = async (c: Context) => {
  const userId = parseInt(c.req.param('userId'));
  if (isNaN(userId)) return c.json({ error: "Invalid user ID" }, 400);

  try {
    const cartItems = await getCartItemsByUser(userId);
    return c.json(cartItems, 200);
  } catch (error) {
    return c.json({ error: "Failed to fetch cart items" }, 500);
  }
};

export const getCartItem = async (c: Context) => {
  const id = parseInt(c.req.param('id'));
  if (isNaN(id)) return c.json({ error: "Invalid cart item ID" }, 400);

  try {
    const item = await getCartItemById(id);
    if (!item) return c.json({ error: "Cart item not found" }, 404);
    return c.json(item, 200);
  } catch (error) {
    return c.json({ error: "Failed to fetch cart item" }, 500);
  }
};

export const createCartItem = async (c: Context) => {
  try {
    const data = await c.req.json();
    const validation = cartItemSchema.safeParse(data);
    if (!validation.success) {
      return c.json({ errors: validation.error.flatten() }, 400);
    }

    const item = await addToCart(validation.data);
    return c.json(item, 201);
  } catch (error) {
    return c.json({ error: "Failed to add to cart" }, 500);
  }
};

export const updateCartItemQuantity = async (c: Context) => {
  const id = parseInt(c.req.param('id'));
  if (isNaN(id)) return c.json({ error: "Invalid cart item ID" }, 400);

  try {
    const data = await c.req.json();
    const validation = cartItemUpdateSchema.safeParse(data);
    if (!validation.success) {
      return c.json({ errors: validation.error.flatten() }, 400);
    }

    const item = await updateCartItem(id, validation.data);
    return c.json(item, 200);
  } catch (error) {
    return c.json({ error: "Failed to update cart item" }, 500);
  }
};

export const deleteCartItem = async (c: Context) => {
  const id = parseInt(c.req.param('id'));
  if (isNaN(id)) return c.json({ error: "Invalid cart item ID" }, 400);

  try {
    const item = await getCartItemById(id);
    if (!item) return c.json({ error: "Cart item not found" }, 404);

    const deleted = await removeFromCart(id);
    return c.json(deleted, 200);
  } catch (error) {
    return c.json({ error: "Failed to remove from cart" }, 500);
  }
};

export const clearCart = async (c: Context) => {
  const userId = parseInt(c.req.param('userId'));
  if (isNaN(userId)) return c.json({ error: "Invalid user ID" }, 400);

  try {
    await clearUserCart(userId);
    return c.json({ message: "Cart cleared successfully" }, 200);
  } catch (error) {
    return c.json({ error: "Failed to clear cart" }, 500);
  }
};