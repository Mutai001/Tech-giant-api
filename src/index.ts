// index.ts
import { Hono } from "hono";
import { cors } from "hono/cors";
import "dotenv/config";
import { logger } from "hono/logger";
import { serve } from "@hono/node-server";

// Import routers
import { authRouter } from './auth/auth.router';
import { categoryRouter } from './categories/categories.router';
import { productRouter } from './product/product.router';
import { productMediaRouter } from './product-media/product-media.router';
import { cartRouter } from './cart/cart.router';

const app = new Hono();

// Middleware
app.use(logger());

// ✅ Updated CORS configuration to include deployed frontend
app.use(
  "*",
  cors({
    origin: [
      "http://localhost:5173",              // local dev
        // deployed frontend
    ],
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

// Health check route
app.get("/", (c) => c.json({ message: "Server is running" }, 200));

// API Routes
app.route("/api/auth", authRouter); // Admin authentication routes  
app.route("/api/categories", categoryRouter); // Category routes
app.route("/api/products", productRouter); // Product routes
app.route("/api/product-media", productMediaRouter); // Product media routes
app.route("/api/cart", cartRouter); // Cart routes



// Global error handler
app.onError((err, c) => {
  console.error("Unhandled error:", err);
  return c.json({ error: "Internal Server Error" }, 500);
});

// Start the server
serve({
  fetch: app.fetch,
  port: Number(process.env.PORT) || 8000,
});

export default app;
