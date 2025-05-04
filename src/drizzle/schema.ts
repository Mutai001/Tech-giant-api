import {
  pgTable,
  serial,
  text,
  varchar,
  integer,
  decimal,
  boolean,
  timestamp,
  pgEnum,
  uniqueIndex,
  json,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Enums
export const roleEnum = pgEnum("role", ["admin"]);
export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
]);

// Users Table (Admin only)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 50 }).unique().notNull(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  role: roleEnum("role").default("admin").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Categories Table
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull(),
  slug: varchar("slug", { length: 50 }).unique().notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Products Table
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).unique().notNull(),
  description: text("description").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  discountPrice: decimal("discount_price", { precision: 10, scale: 2 }),
  stockQuantity: integer("stock_quantity").notNull().default(0),
  categoryId: integer("category_id").notNull(),
  badge: varchar("badge", { length: 20 }),
  isFeatured: boolean("is_featured").default(false),
  rating: decimal("rating", { precision: 2, scale: 1 }).default("0.0"),
  imageUrl: varchar("image_url", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdateFn(() => new Date()),
});

// Product Images Table
export const productImages = pgTable("product_images", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull(),
  imageUrl: varchar("image_url", { length: 255 }).notNull(),
  isThumbnail: boolean("is_thumbnail").default(false),
});

// Product Features Table
export const productFeatures = pgTable("product_features", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  value: varchar("value", { length: 100 }).notNull(),
});

// Orders Table
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  customerName: varchar("customer_name", { length: 100 }).notNull(),
  customerPhone: varchar("customer_phone", { length: 20 }).notNull(),
  customerEmail: varchar("customer_email", { length: 100 }),
  status: orderStatusEnum("status").default("pending"),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdateFn(() => new Date()),
});

// Order Items Table
export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  productId: integer("product_id").notNull(),
  quantity: integer("quantity").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
});





//Relations
// Users Relations
export const usersRelations = relations(users, ({ many }) => ({
  products: many(products),
  orders: many(orders),
}));

// Categories Relations
export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

// Products Relations
export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  images: many(productImages),
  features: many(productFeatures),
  orderItems: many(orderItems),
}));

// Product Images Relations
export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, {
    fields: [productImages.productId],
    references: [products.id],
  }),
}));

// Product Features Relations
export const productFeaturesRelations = relations(productFeatures, ({ one }) => ({
  product: one(products, {
    fields: [productFeatures.productId],
    references: [products.id],
  }),
}));

// Orders Relations
export const ordersRelations = relations(orders, ({ many }) => ({
  items: many(orderItems),
}));

// Order Items Relations
export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));


// Exporting all tables and relations for use in the application
// Users
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

// Categories
export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;

// Products
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;

// Product Images
export type ProductImage = typeof productImages.$inferSelect;
export type NewProductImage = typeof productImages.$inferInsert;

// Product Features
export type ProductFeature = typeof productFeatures.$inferSelect;
export type NewProductFeature = typeof productFeatures.$inferInsert;

// Orders
export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;

// Order Items
export type OrderItem = typeof orderItems.$inferSelect;
export type NewOrderItem = typeof orderItems.$inferInsert;