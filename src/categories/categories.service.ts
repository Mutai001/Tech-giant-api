import { eq } from "drizzle-orm";
import db from "../drizzle/db";
import { categories, Category, NewCategory } from "../drizzle/schema";

export const categoriesService = async (limit?: number): Promise<Category[] | null> => {
  if (limit) {
    return await db.query.categories.findMany({
      limit: limit,
    });
  }
  return await db.query.categories.findMany();
};

export const getCategoryService = async (id: number): Promise<NewCategory | undefined> => {
  return await db.query.categories.findFirst({
    where: eq(categories.categoryId, id),
  });
};

export const createCategoryService = async (category: NewCategory) => {
  await db.insert(categories).values(category);
  return "Category created successfully";
};

export const updateCategoryService = async (id: number, category: NewCategory) => {
  await db.update(categories).set(category).where(eq(categories.categoryId, id));
  return "Category updated successfully";
};

export const deleteCategoryService = async (id: number) => {
  await db.delete(categories).where(eq(categories.categoryId, id));
  return "Category deleted successfully";
};