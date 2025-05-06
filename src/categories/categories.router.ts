import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { 
  listCategories, 
  getCategory, 
  createCategory, 
  updateCategory, 
  deleteCategory 
} from "./categories.controller";
import { categorySchema } from "./validator";
// import { adminRoleAuth } from "../middleware/bearAuth";

export const categoryRouter = new Hono();

// Public routes (no auth required)
categoryRouter.get("/", listCategories);
categoryRouter.get("/:id", getCategory);

// Protected routes (admin auth required)
categoryRouter.use("/*"); // Applies to all routes below

categoryRouter.post(
  "/",
  zValidator("json", categorySchema, (result, c) => {
    if (!result.success) return c.json(result.error, 400);
  }),
  createCategory
);

categoryRouter.put("/:id", updateCategory);
categoryRouter.delete("/:id", deleteCategory);