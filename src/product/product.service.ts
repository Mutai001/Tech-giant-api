import { eq, and } from "drizzle-orm";
import db from "../drizzle/db";
import { products, Product, NewProduct, productMedia } from "../drizzle/schema";

export const getProductsService = async (limit?: number, categoryId?: number) => {
  return await db.query.products.findMany({
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

export const createProductService = async (product: NewProduct) => {
  const [newProduct] = await db.insert(products).values(product).returning();
  return newProduct;
};

export const updateProductService = async (id: number, product: Partial<Product>) => {
  const [updatedProduct] = await db.update(products)
    .set({
      ...product,
      updatedAt: new Date()
    })
    .where(eq(products.productId, id))
    .returning();
  return updatedProduct;
};

export const deleteProductService = async (id: number) => {
  const [deletedProduct] = await db.delete(products)
    .where(eq(products.productId, id))
    .returning();
  return deletedProduct;
};

export const addProductMediaService = async (media: typeof productMedia.$inferInsert) => {
  const [newMedia] = await db.insert(productMedia).values(media).returning();
  return newMedia;
};

export const removeProductMediaService = async (mediaId: number, productId: number) => {
  const [deletedMedia] = await db.delete(productMedia)
    .where(and(
      eq(productMedia.mediaId, mediaId),
      eq(productMedia.productId, productId)
    ))
    .returning();
  return deletedMedia;
};