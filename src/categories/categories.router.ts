import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import {
  listCategories,
  getCategory,
  updateCategory,
  deleteCategory,
  handleCreateCategory
} from "./categories.controller";
import { categorySchema, categoryUpdateSchema } from "./categories.validator";

const categoryRouter = new Hono();

// Public routes
categoryRouter.get("/", listCategories);
categoryRouter.get("/:id{[0-9]+}", getCategory);

// Protected routes (admin only)
categoryRouter.post(
  "/",
  zValidator("json", categorySchema),
  handleCreateCategory
);

categoryRouter.patch(
  "/:id{[0-9]+}",
  zValidator("json", categoryUpdateSchema),
  updateCategory
);

categoryRouter.delete("/:id{[0-9]+}", deleteCategory);

export default categoryRouter;