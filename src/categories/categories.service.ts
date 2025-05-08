import { eq, and, ne } from "drizzle-orm";
import db from "../drizzle/db";
import { categories } from "../drizzle/schema";
import type { Category, NewCategory } from "../drizzle/schema";

export const getAllCategories = async (limit?: number): Promise<Category[]> => {
  const query = db.select().from(categories).orderBy(categories.createdAt);
  if (limit) query.limit(limit);
  return await query;
};

export const getCategoryById = async (id: number): Promise<Category | null> => {
  const [category] = await db.select()
    .from(categories)
    .where(eq(categories.categoryId, id));
  return category || null;
};

export const createCategory = async (categoryData: NewCategory): Promise<Category> => {
  const [category] = await db.insert(categories)
    .values(categoryData)
    .returning();
  return category;
};

export const updateCategory = async (
  id: number,
  categoryData: Partial<NewCategory>
): Promise<Category> => {
  const [category] = await db.update(categories)
    .set({
      ...categoryData,
      updatedAt: new Date()
    })
    .where(eq(categories.categoryId, id))
    .returning();
  return category;
};

export const deleteCategory = async (id: number): Promise<Category> => {
  const [category] = await db.delete(categories)
    .where(eq(categories.categoryId, id))
    .returning();
  return category;
};

export const checkCategoryExists = async (name: string, excludeId?: number) => {
  const query = db.select()
    .from(categories)
    .where(
      excludeId 
        ? and(
            eq(categories.name, name),
            ne(categories.categoryId, excludeId)
          )
        : eq(categories.name, name)
    );
  const [existing] = await query;
  return !!existing;
};