import { Context } from "hono";
import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory as updateCategoryService,
  deleteCategory as deleteCategoryService,
  checkCategoryExists
} from "./categories.service";
import { categorySchema, categoryUpdateSchema } from "./categories.validator";

export const listCategories = async (c: Context) => {
  try {
    const limitQuery = c.req.query('limit');
    const limit = limitQuery !== undefined ? parseInt(limitQuery) : undefined;
    if (limit && isNaN(limit)) {
      return c.json({ error: "Invalid limit parameter" }, 400);
    }

    const categories = await getAllCategories(limit);
    return c.json(categories, 200);
  } catch (error) {
    return c.json({ error: "Failed to fetch categories" }, 500);
  }
};

export const getCategory = async (c: Context) => {
  const id = parseInt(c.req.param('id'));
  if (isNaN(id)) return c.json({ error: "Invalid category ID" }, 400);

  try {
    const category = await getCategoryById(id);
    if (!category) return c.json({ error: "Category not found" }, 404);
    return c.json(category, 200);
  } catch (error) {
    return c.json({ error: "Failed to fetch category" }, 500);
  }
};

export const handleCreateCategory = async (c: Context) => {
  try {
    const data = await c.req.json();
    const validation = categorySchema.safeParse(data);
    if (!validation.success) {
      return c.json({ errors: validation.error.flatten() }, 400);
    }

    const exists = await checkCategoryExists(validation.data.name);
    if (exists) {
      return c.json({ error: "Category name already exists" }, 409);
    }

    const category = await createCategory(validation.data);
    return c.json(category, 201);
  } catch (error) {
    return c.json({ error: "Failed to create category" }, 500);
  }
};

export const updateCategory = async (c: Context) => {
  const id = parseInt(c.req.param('id'));
  if (isNaN(id)) return c.json({ error: "Invalid category ID" }, 400);

  try {
    const data = await c.req.json();
    const validation = categoryUpdateSchema.safeParse(data);
    if (!validation.success) {
      return c.json({ errors: validation.error.flatten() }, 400);
    }

    if (data.name) {
      const exists = await checkCategoryExists(data.name, id);
      if (exists) {
        return c.json({ error: "Category name already exists" }, 409);
      }
    }

    const category = await updateCategoryService(id, validation.data);
    return c.json(category, 200);
  } catch (error) {
    return c.json({ error: "Failed to update category" }, 500);
  }
};

export const deleteCategory = async (c: Context) => {
  const id = parseInt(c.req.param('id'));
  if (isNaN(id)) return c.json({ error: "Invalid category ID" }, 400);

  try {
    const category = await getCategoryById(id);
    if (!category) return c.json({ error: "Category not found" }, 404);

    const deleted = await deleteCategoryService(id);
    return c.json(deleted, 200);
  } catch (error) {
    return c.json({ error: "Failed to delete category" }, 500);
  }
};