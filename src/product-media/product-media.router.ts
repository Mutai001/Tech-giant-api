import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import {
  getProductMedia,
  getMedia,
  createMedia,
  updateMedia,
  deleteMedia
} from "./product-media.controller";
import { productMediaSchema, updateProductMediaSchema } from "./product-media.validator";
import { adminRoleAuth } from "../middleware/bearAuth";

export const productMediaRouter = new Hono();

// Public routes
productMediaRouter.get("/product/:productId", getProductMedia);
productMediaRouter.get("/:mediaId", getMedia);

// Protected routes (admin only)
productMediaRouter.use("/*", adminRoleAuth);

productMediaRouter.post(
  "/",
  zValidator("json", productMediaSchema, (result, c) => {
    if (!result.success) return c.json(result.error, 400);
  }),
  createMedia
);

productMediaRouter.put(
  "/:mediaId/product/:productId",
  zValidator("json", updateProductMediaSchema, (result, c) => {
    if (!result.success) return c.json(result.error, 400);
  }),
  updateMedia
);

productMediaRouter.delete("/:mediaId/product/:productId", deleteMedia);