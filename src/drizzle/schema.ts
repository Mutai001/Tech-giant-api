import {
  pgTable,
  serial,
  text,
  varchar,
  integer,
  decimal,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Admins Table
export const admins = pgTable("admins", {
  adminId: serial("admin_id").primaryKey(),
  fullName: varchar("full_name", { length: 100 }).notNull(),
  email: varchar("email", { length: 100 }).unique().notNull(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Categories Table
export const categories = pgTable("categories", {
  categoryId: serial("category_id").primaryKey(),
  name: varchar("name", { length: 50 }).unique().notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Products Table
export const products = pgTable("products", {
  productId: serial("product_id").primaryKey(),
  name: varchar("name", { length: 150 }).notNull(),
  categoryId: integer("category_id").references(() => categories.categoryId, { onDelete: "set null" }),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  discountPrice: decimal("discount_price", { precision: 10, scale: 2 }),
  stockLeft: integer("stock_left").notNull(),
  badge: varchar("badge", { length: 50 }),
  description: text("description"),
  createdBy: integer("created_by").references(() => admins.adminId, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdateFn(() => new Date()),
});

// ProductMedia Table
export const productMedia = pgTable("product_media", {
  mediaId: serial("media_id").primaryKey(),
  productId: integer("product_id").references(() => products.productId, { onDelete: "cascade" }).notNull(),
  mediaUrl: text("media_url").notNull(),
  mediaType: varchar("media_type", { length: 10, enum: ["image", "video"] }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const adminsRelations = relations(admins, ({ many }) => ({
  products: many(products),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.categoryId],
  }),
  createdBy: one(admins, {
    fields: [products.createdBy],
    references: [admins.adminId],
  }),
  media: many(productMedia),
}));

export const productMediaRelations = relations(productMedia, ({ one }) => ({
  product: one(products, {
    fields: [productMedia.productId],
    references: [products.productId],
  }),
}));

// Type exports
export type Admin = typeof admins.$inferSelect;
export type NewAdmin = typeof admins.$inferInsert;

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;

export type ProductMedia = typeof productMedia.$inferSelect;
export type NewProductMedia = typeof productMedia.$inferInsert;