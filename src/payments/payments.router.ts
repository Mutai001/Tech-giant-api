import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import {
  createNewPayment,
  getAllPaymentService,
  getPayment,
  updatePaymentStatus,
  listOrderPayments,
  listUserPayments,
  initiateMpesaPaymentHandler,
  mpesaCallbackHandler
} from "./payments.controller";
import { paymentSchema, mpesaPaymentSchema, paymentUpdateSchema } from "./payments.validator";

const paymentRouter = new Hono();

// Add middleware to log requests (optional)
paymentRouter.use('*', async (c, next) => {
  console.log(`[${c.req.method}] ${c.req.path}`);
  await next();
});

// Payment operations
paymentRouter.post(
  "/",
  zValidator("json", paymentSchema),
  createNewPayment
);

paymentRouter.post(
  "/mpesa",
  zValidator("json", mpesaPaymentSchema),
  initiateMpesaPaymentHandler
);

paymentRouter.post(
  "/mpesa-callback", 
  mpesaCallbackHandler
);

// Payment management
paymentRouter.get("/:id{[0-9]+}", getPayment);
paymentRouter.patch(
  "/:id{[0-9]+}",
  zValidator("json", paymentUpdateSchema),
  updatePaymentStatus
);

// Get all payments
paymentRouter.get("/", getAllPaymentService);

// Query routes
paymentRouter.get("/order/:orderId{[0-9]+}", listOrderPayments);
paymentRouter.get("/user/:userId{[0-9]+}", listUserPayments);

export { paymentRouter };