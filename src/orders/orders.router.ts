import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import {
  listUserOrders,
  getOrder,
  createNewOrder,
  updateOrderStatus,
  cancelUserOrder,
  listOrdersByStatus
} from "./orders.controller";
import { orderSchema, orderUpdateSchema } from "./orders.validator";

export const orderRouter = new Hono();

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

// export default orderRouter;