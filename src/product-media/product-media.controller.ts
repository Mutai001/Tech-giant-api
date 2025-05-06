import { Context } from "hono";
import {
  getProductMediaService,
  getMediaByIdService,
  createProductMediaService,
  updateProductMediaService,
  deleteProductMediaService
} from "./product-media.service";

export const getProductMedia = async (c: Context) => {
  const productId = Number(c.req.param("productId"));
  if (isNaN(productId)) return c.json({ error: "Invalid product ID" }, 400);

  try {
    const media = await getProductMediaService(productId);
    return c.json(media, 200);
  } catch (error: any) {
    return c.json({ error: error?.message }, 500);
  }
};

export const getMedia = async (c: Context) => {
  const mediaId = Number(c.req.param("mediaId"));
  if (isNaN(mediaId)) return c.json({ error: "Invalid media ID" }, 400);

  try {
    const media = await getMediaByIdService(mediaId);
    if (!media) return c.json({ error: "Media not found" }, 404);
    return c.json(media, 200);
  } catch (error: any) {
    return c.json({ error: error?.message }, 500);
  }
};

export const createMedia = async (c: Context) => {
  try {
    const mediaData = await c.req.json();
    const newMedia = await createProductMediaService(mediaData);
    return c.json(newMedia, 201);
  } catch (error: any) {
    return c.json({ error: error?.message }, 400);
  }
};

export const updateMedia = async (c: Context) => {
  const mediaId = Number(c.req.param("mediaId"));
  const productId = Number(c.req.param("productId"));
  
  if (isNaN(mediaId) || isNaN(productId)) {
    return c.json({ error: "Invalid IDs" }, 400);
  }

  try {
    const updates = await c.req.json();
    const updatedMedia = await updateProductMediaService(mediaId, productId, updates);
    if (!updatedMedia) return c.json({ error: "Media not found" }, 404);
    return c.json(updatedMedia, 200);
  } catch (error: any) {
    return c.json({ error: error?.message }, 400);
  }
};

export const deleteMedia = async (c: Context) => {
  const mediaId = Number(c.req.param("mediaId"));
  const productId = Number(c.req.param("productId"));
  
  if (isNaN(mediaId) || isNaN(productId)) {
    return c.json({ error: "Invalid IDs" }, 400);
  }

  try {
    const media = await deleteProductMediaService(mediaId, productId);
    if (!media) return c.json({ error: "Media not found" }, 404);
    return c.json({ message: "Media deleted successfully" }, 200);
  } catch (error: any) {
    return c.json({ error: error?.message }, 400);
  }
};