import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import {
  getUserCart,
  getCartItem,
  createCartItem,
  updateCartItemQuantity,
  deleteCartItem,
  clearCart
} from "./cart.controller";
import { cartItemSchema, cartItemUpdateSchema } from "./cart.validator";

const cartRouter = new Hono();

// Get user's cart
cartRouter.get("/user/:userId{[0-9]+}", getUserCart);

// Clear user's cart
cartRouter.delete("/user/:userId{[0-9]+}/clear", clearCart);

// Cart item operations
cartRouter.post(
  "/",
  zValidator("json", cartItemSchema),
  createCartItem
);

cartRouter.get("/:id{[0-9]+}", getCartItem);

cartRouter.patch(
  "/:id{[0-9]+}",
  zValidator("json", cartItemUpdateSchema),
  updateCartItemQuantity
);

cartRouter.delete("/:id{[0-9]+}", deleteCartItem);

export default cartRouter;