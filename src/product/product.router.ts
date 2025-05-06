import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  addMedia,
  removeMedia
} from "./product.controller";
import { productSchema, productMediaSchema } from "./product.validator";
import { adminRoleAuth } from "../middleware/bearAuth";

export const productRouter = new Hono();

// Public routes
productRouter.get("/", getProducts);
productRouter.get("/:id", getProduct);

// Protected routes
productRouter.use("/*", 
    adminRoleAuth
);

productRouter.post(
  "/",
  zValidator("json", productSchema, (result, c) => {
    if (!result.success) return c.json(result.error, 400);
  }),
  createProduct
);

productRouter.put("/:id", updateProduct);
productRouter.delete("/:id", deleteProduct);

// Media routes
productRouter.post(
  "/media",
  zValidator("json", productMediaSchema, (result, c) => {
    if (!result.success) return c.json(result.error, 400);
  }),
  addMedia
);

productRouter.delete("/media/:mediaId/product/:productId", removeMedia);