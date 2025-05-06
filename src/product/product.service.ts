import { eq, and } from "drizzle-orm";
import db from "../drizzle/db";
import { products, Product, NewProduct, productMedia } from "../drizzle/schema";
import { adminRoleAuth } from "../middleware/bearAuth";

export const getProductsService = async (limit?: number, categoryId?: number) => {
  const query = db.query.products.findMany({
    limit: limit,
    where: categoryId ? eq(products.categoryId, categoryId) : undefined,
    with: {
      category: true,
      media: true,
      createdBy: {
        columns: {
          fullName: true,
          email: true
        }
      }
    }
  });
  return await query;
};

export const getProductByIdService = async (id: number) => {
  return await db.query.products.findFirst({
    where: eq(products.productId, id),
    with: {
      category: true,
      media: true,
      createdBy: true
    }
  });
};

export const createProductService = async (product: NewProduct, adminId: number) => {
  const [newProduct] = await db.insert(products).values({
    ...product,
    createdBy: adminId
  }).returning();
  return newProduct;
};

export const updateProductService = async (id: number, product: Partial<Product>, adminId: number) => {
  const [updatedProduct] = await db.update(products)
    .set({
      ...product,
      updatedAt: new Date()
    })
    .where(and(
      eq(products.productId, id),
      eq(products.createdBy, adminId)
    ))
    .returning();
  return updatedProduct;
};

export const deleteProductService = async (id: number, adminId: number) => {
  const deletedProduct = await db.delete(products)
    .where(and(
      eq(products.productId, id),
      eq(products.createdBy, adminId)
    ))
    .returning();
  return deletedProduct[0];
};

export const addProductMediaService = async (media: typeof productMedia.$inferInsert) => {
  const [newMedia] = await db.insert(productMedia).values(media).returning();
  return newMedia;
};

export const removeProductMediaService = async (mediaId: number, productId: number) => {
  const deletedMedia = await db.delete(productMedia)
    .where(and(
      eq(productMedia.mediaId, mediaId),
      eq(productMedia.productId, productId)
    ))
    .returning();
  return deletedMedia[0];
};