import {
  pgTable,
  serial,
  text,
  varchar,
  integer,
  decimal,
  timestamp,
  boolean,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Users Table (replaces admins with role-based access)
export const users = pgTable("users", {
  userId: serial("user_id").primaryKey(),
  fullName: varchar("full_name", { length: 100 }).notNull(),
  email: varchar("email", { length: 100 }).unique().notNull(),
  phone: varchar("phone", { length: 20 }).unique().notNull(),
  passwordHash: text("password_hash").notNull(),
  role: varchar("role", { length: 20 }).notNull().default("user"), // "admin" | "user"
  address: text("address"),
  isVerified: boolean("is_verified").default(false),
  verificationCode: varchar("verification_code", { length: 6 }),
  verificationCodeExpires: timestamp("verification_code_expires"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdateFn(() => new Date()),
});

// Categories Table
export const categories = pgTable("categories", {
  categoryId: serial("category_id").primaryKey(),
  name: varchar("name", { length: 50 }).unique().notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdateFn(() => new Date()),
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
  createdBy: integer("created_by").references(() => users.userId, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdateFn(() => new Date()),
});

// ProductMedia Table
export const productMedia = pgTable("product_media", {
  mediaId: serial("media_id").primaryKey(),
  productId: integer("product_id").references(() => products.productId, { onDelete: "cascade" }).notNull(),
  mediaUrl: text("media_url").notNull(),
  mediaType: varchar("media_type", { length: 10, enum: ["image", "video"] }).notNull(),
  isFeatured: boolean("is_featured").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Cart Items Table
export const cartItems = pgTable("cart_items", {
  cartItemId: serial("cart_item_id").primaryKey(),
  userId: integer("user_id").references(() => users.userId, { onDelete: "cascade" }).notNull(),
  productId: integer("product_id").references(() => products.productId, { onDelete: "cascade" }).notNull(),
  quantity: integer("quantity").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdateFn(() => new Date()),
});

// Orders Table
export const orders = pgTable("orders", {
  orderId: serial("order_id").primaryKey(),
  userId: integer("user_id").references(() => users.userId, { onDelete: "cascade" }).notNull(),
  status: varchar("status", { length: 50 }).default("pending"), // pending, paid, shipped, delivered, cancelled
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  paymentStatus: varchar("payment_status", { length: 50 }).default("unpaid"), // unpaid, pending, paid, failed, refunded
  shippingAddress: text("shipping_address").notNull(),
  contactPhone: varchar("contact_phone", { length: 20 }).notNull(),
  trackingNumber: varchar("tracking_number", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdateFn(() => new Date()),
});

// Order Items Table
export const orderItems = pgTable("order_items", {
  itemId: serial("item_id").primaryKey(),
  orderId: integer("order_id").references(() => orders.orderId, { onDelete: "cascade" }).notNull(),
  productId: integer("product_id").references(() => products.productId, { onDelete: "cascade" }).notNull(),
  quantity: integer("quantity").notNull(),
  priceAtPurchase: decimal("price_at_purchase", { precision: 10, scale: 2 }).notNull(),
  discountApplied: decimal("discount_applied", { precision: 10, scale: 2 }).default("0.00"),
});

// Payments Table
export const payments = pgTable("payments", {
  paymentId: serial("payment_id").primaryKey(),
  orderId: integer("order_id"),
  userId: integer("user_id"),
  method: text("method"),
  amount: text("amount"),
  status: text("status"),
  phoneNumber: text("phone_number"),
  merchantRequestId: text("merchant_request_id"),
  checkoutRequestId: text("checkout_request_id"),
  transactionCode: text("transaction_code"),
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at") // Added updatedAt field
});

// ========== RELATIONS ========== //

// Users Relations
export const usersRelations = relations(users, ({ many }) => ({
  products: many(products),
  cartItems: many(cartItems),
  orders: many(orders),
  payments: many(payments),
}));

// Categories Relations
export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

// Products Relations
export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.categoryId],
  }),
  createdBy: one(users, {
    fields: [products.createdBy],
    references: [users.userId],
  }),
  media: many(productMedia),
  cartItems: many(cartItems),
  orderItems: many(orderItems),
}));

// ProductMedia Relations
export const productMediaRelations = relations(productMedia, ({ one }) => ({
  product: one(products, {
    fields: [productMedia.productId],
    references: [products.productId],
  }),
}));

// Cart Items Relations
export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  user: one(users, {
    fields: [cartItems.userId],
    references: [users.userId],
  }),
  product: one(products, {
    fields: [cartItems.productId],
    references: [products.productId],
  }),
}));

// Orders Relations
export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.userId],
  }),
  items: many(orderItems),
  payments: many(payments),
}));

// Order Items Relations
export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.orderId],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.productId],
  }),
}));

// Payments Relations
export const paymentsRelations = relations(payments, ({ one }) => ({
  order: one(orders, {
    fields: [payments.orderId],
    references: [orders.orderId],
  }),
  user: one(users, {
    fields: [payments.userId],
    references: [users.userId],
  }),
}));

// ========== TYPE EXPORTS ========== //

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;

export type ProductMedia = typeof productMedia.$inferSelect;
export type NewProductMedia = typeof productMedia.$inferInsert;

export type CartItem = typeof cartItems.$inferSelect;
export type NewCartItem = typeof cartItems.$inferInsert;

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;

export type OrderItem = typeof orderItems.$inferSelect;
export type NewOrderItem = typeof orderItems.$inferInsert;

export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;