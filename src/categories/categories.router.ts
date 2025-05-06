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
import { adminRoleAuth } from "../middleware/bearAuth";

export const categoryRouter = new Hono();

// Apply admin auth middleware for write operations
categoryRouter.use("/*", adminRoleAuth);

// Get all categories
categoryRouter.get("/", listCategories);

// Get a single category
categoryRouter.get("/:id", getCategory);

// Create a new category
categoryRouter.post(
  "/",
  zValidator("json", categorySchema, (result, c) => {
    if (!result.success) {
      return c.json(result.error, 400);
    }
  }),
  createCategory
);

// Update a category
categoryRouter.put("/:id", updateCategory);

// Delete a category
categoryRouter.delete("/:id", deleteCategory);