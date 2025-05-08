import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import {
  listOrderItems,
  getOrderItem,
  createNewOrderItem,
  updateExistingItem,
  deleteItem,
  listItemsByProduct
} from "./order-items.controller";
import { orderItemSchema, orderItemUpdateSchema } from "./order-items.validator";

const orderItemRouter = new Hono();

// Order-based routes
orderItemRouter.get("/order/:orderId{[0-9]+}", listOrderItems);

// Product-based routes
orderItemRouter.get("/product/:productId{[0-9]+}", listItemsByProduct);

// CRUD operations
orderItemRouter.post(
  "/",
  zValidator("json", orderItemSchema),
  createNewOrderItem
);

orderItemRouter.get("/:id{[0-9]+}", getOrderItem);

orderItemRouter.patch(
  "/:id{[0-9]+}",
  zValidator("json", orderItemUpdateSchema),
  updateExistingItem
);

orderItemRouter.delete("/:id{[0-9]+}", deleteItem);

export default orderItemRouter;