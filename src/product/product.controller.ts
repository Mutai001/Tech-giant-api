import { Context } from "hono";
import {
  getProductsService,
  getProductByIdService,
  createProductService,
  updateProductService,
  deleteProductService,
  addProductMediaService,
  removeProductMediaService
} from "./product.service";
import * as bcrypt from "bcrypt";

export const getProducts = async (c: Context) => {
  try {
    const limit = Number(c.req.query("limit"));
    const categoryId = Number(c.req.query("categoryId"));
    const products = await getProductsService(limit, categoryId);
    return c.json(products, 200);
  } catch (error: any) {
    return c.json({ error: error?.message }, 500);
  }
};

export const getProduct = async (c: Context) => {
  const id = Number(c.req.param("id"));
  if (isNaN(id)) return c.json({ error: "Invalid ID" }, 400);

  try {
    const product = await getProductByIdService(id);
    if (!product) return c.json({ error: "Product not found" }, 404);
    return c.json(product, 200);
  } catch (error: any) {
    return c.json({ error: error?.message }, 500);
  }
};

export const createProduct = async (c: Context) => {
  try {
    const productData = await c.req.json();
    const adminId = c.get('admin').adminId;
    const product = await createProductService(productData, adminId);
    return c.json(product, 201);
  } catch (error: any) {
    return c.json({ error: error?.message }, 400);
  }
};

export const updateProduct = async (c: Context) => {
  const id = Number(c.req.param("id"));
  if (isNaN(id)) return c.json({ error: "Invalid ID" }, 400);

  try {
    const productData = await c.req.json();
    const adminId = c.get('admin').adminId;
    const product = await updateProductService(id, productData, adminId);
    if (!product) return c.json({ error: "Product not found or unauthorized" }, 404);
    return c.json(product, 200);
  } catch (error: any) {
    return c.json({ error: error?.message }, 400);
  }
};

export const deleteProduct = async (c: Context) => {
  const id = Number(c.req.param("id"));
  if (isNaN(id)) return c.json({ error: "Invalid ID" }, 400);

  try {
    const adminId = c.get('admin').adminId;
    const product = await deleteProductService(id, adminId);
    if (!product) return c.json({ error: "Product not found or unauthorized" }, 404);
    return c.json({ message: "Product deleted" }, 200);
  } catch (error: any) {
    return c.json({ error: error?.message }, 400);
  }
};

export const addMedia = async (c: Context) => {
  try {
    const mediaData = await c.req.json();
    const newMedia = await addProductMediaService(mediaData);
    return c.json(newMedia, 201);
  } catch (error: any) {
    return c.json({ error: error?.message }, 400);
  }
};

export const removeMedia = async (c: Context) => {
  const mediaId = Number(c.req.param("mediaId"));
  const productId = Number(c.req.param("productId"));
  
  if (isNaN(mediaId) || isNaN(productId)) {
    return c.json({ error: "Invalid IDs" }, 400);
  }

  try {
    const media = await removeProductMediaService(mediaId, productId);
    if (!media) return c.json({ error: "Media not found" }, 404);
    return c.json({ message: "Media removed" }, 200);
  } catch (error: any) {
    return c.json({ error: error?.message }, 400);
  }
};