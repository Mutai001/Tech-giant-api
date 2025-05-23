import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import {
  listOrders,
  listUserOrders,
  getOrder,
  createNewOrder,
  updateOrderStatus,
  cancelUserOrder,
  listOrdersByStatus
} from "./orders.controller";
import { orderSchema, orderUpdateSchema } from "./orders.validator";

export const orderRouter = new Hono();

// List all orders (admin only)
orderRouter.get("/", listOrders);

// User-specific routes
orderRouter.get("/user/:userId{[0-9]+}", listUserOrders);

// Status-based routes
orderRouter.get("/status/:status", listOrdersByStatus);

// Order operations
orderRouter.post(
  "/",
  zValidator("json", orderSchema),
  createNewOrder
);

orderRouter.get("/:id{[0-9]+}", getOrder);

orderRouter.patch(
  "/:id{[0-9]+}",
  zValidator("json", orderUpdateSchema),
  updateOrderStatus
);

orderRouter.delete("/:id{[0-9]+}/cancel", cancelUserOrder);

export default orderRouter;