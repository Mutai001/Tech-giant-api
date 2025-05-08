import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import {
  createNewPayment,
  getPayment,
  updatePaymentStatus,
  listOrderPayments,
  listUserPayments,
  initiateMpesaPaymentHandler,
  mpesaCallbackHandler
} from "./payments.controller";
import { paymentSchema, mpesaPaymentSchema, paymentUpdateSchema } from "./payments.validator";

export const paymentRouter = new Hono();

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

paymentRouter.post("/mpesa-callback", mpesaCallbackHandler);

paymentRouter.get("/:id{[0-9]+}", getPayment);
paymentRouter.patch(
  "/:id{[0-9]+}",
  zValidator("json", paymentUpdateSchema),
  updatePaymentStatus
);

// Query routes
paymentRouter.get("/order/:orderId{[0-9]+}", listOrderPayments);
paymentRouter.get("/user/:userId{[0-9]+}", listUserPayments);

