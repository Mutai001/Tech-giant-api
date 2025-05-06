import { Context } from "hono";
import { 
  categoriesService, 
  getCategoryService, 
  createCategoryService, 
  updateCategoryService, 
  deleteCategoryService 
} from "./categories.service";

//LIst all categories or a limited number of categories
export const listCategories = async (c: Context) => {
  try {
    const limit = Number(c.req.query("limit"));
    const data = await categoriesService(limit);
    if (data == null || data.length === 0) {
      return c.text("No categories found", 404);
    }
    return c.json(data, 200);
  } catch (error: any) {
    return c.json({ error: error?.message }, 400);
  }
};

// Get a single category by ID
export const getCategory = async (c: Context) => {
  const id = parseInt(c.req.param("id"));
  if (isNaN(id)) return c.text("Invalid ID", 400);

  const category = await getCategoryService(id);
  if (category === undefined) {
    return c.text("Category not found", 404);
  }
  return c.json(category, 200);
};

// Create a new category
export const createCategory = async (c: Context) => {
  try {
    const category = await c.req.json();
    const createdCategory = await createCategoryService(category);

    if (!createdCategory) return c.text("Category not created", 400);
    return c.json({ msg: createdCategory }, 201);
  } catch (error: any) {
    return c.json({ error: error?.message }, 400);
  }
};

// Update an existing category by ID
export const updateCategory = async (c: Context) => {
  const id = parseInt(c.req.param("id"));
  if (isNaN(id)) return c.text("Invalid ID", 400);

  const category = await c.req.json();
  try {
    const searchedCategory = await getCategoryService(id);
    if (searchedCategory === undefined) return c.text("Category not found", 404);

    const res = await updateCategoryService(id, category);
    if (!res) return c.text("Category not updated", 400);

    return c.json({ msg: res }, 200);
  } catch (error: any) {
    return c.json({ error: error?.message }, 400);
  }
};

// Delete a category by ID
export const deleteCategory = async (c: Context) => {
  const id = Number(c.req.param("id"));
  if (isNaN(id)) return c.text("Invalid ID", 400);

  try {
    const category = await getCategoryService(id);
    if (category === undefined) return c.text("Category not found", 404);

    const res = await deleteCategoryService(id);
    if (!res) return c.text("Category not deleted", 400);

    return c.json({ msg: res }, 200);
  } catch (error: any) {
    return c.json({ error: error?.message }, 400);
  }
};