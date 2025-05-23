import { eq, and } from "drizzle-orm";
import db from "../drizzle/db";
import { productMedia, ProductMedia, NewProductMedia } from "../drizzle/schema";
// import { adminRoleAuth } from "../middleware/bearAuth";

export const getProductMediaService = async (productId: number) => {
  return await db.query.productMedia.findMany({
    where: eq(productMedia.productId, productId),
    orderBy: (media, { asc }) => [asc(media.createdAt)],
  });
};

export const getMediaByIdService = async (mediaId: number) => {
  return await db.query.productMedia.findFirst({
    where: eq(productMedia.mediaId, mediaId),
  });
};

export const createProductMediaService = async (media: NewProductMedia) => {
  const [newMedia] = await db.insert(productMedia).values(media).returning();
  return newMedia;
};

export const updateProductMediaService = async (
  mediaId: number,
  productId: number,
  updates: Partial<ProductMedia>
) => {
  const [updatedMedia] = await db.update(productMedia)
    .set(updates)
    .where(and(
      eq(productMedia.mediaId, mediaId),
      eq(productMedia.productId, productId)
    ))
    .returning();
  return updatedMedia;
};

export const deleteProductMediaService = async (mediaId: number, productId: number) => {
  const [deletedMedia] = await db.delete(productMedia)
    .where(and(
      eq(productMedia.mediaId, mediaId),
      eq(productMedia.productId, productId)
    ))
    .returning();
  return deletedMedia;
};