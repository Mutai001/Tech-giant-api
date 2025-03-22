import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { listUsers, getUser, createUser, updateUser, deleteUser } from "./users.controller";
import { usersSchema } from "./validator";
import { adminRoleAuth } from "../middleware/bearAuth";
import { db } from "../drizzle/db"; // Your Drizzle DB connection
import { users, bookings } from "../drizzle/schema";
import nodemailer from "nodemailer";
import { eq } from "drizzle-orm";
import dotenv from "dotenv";

dotenv.config();

export const userRouter = new Hono();

// ✅ Get all users
userRouter.get("/users", listUsers);

// ✅ Get a single user (e.g., /api/users/1)
userRouter.get("/users/:id", getUser);

// ✅ Create a user
userRouter.post(
  "/users",
  zValidator("json", usersSchema, (result, c) => {
    if (!result.success) {
      return c.json(result.error, 400);
    }
  }),
  createUser
);

// ✅ Update a user
userRouter.put("/users/:id", updateUser);

// ✅ Delete a user
userRouter.delete("/users/:id", deleteUser);

// ✅ Configure Nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  secure: true, // Ensure SSL/TLS
  tls: {
    rejectUnauthorized: false, // Consider for development, not recommended for production
  },
});


// ✅ Therapist sends Google Meet link
userRouter.post("/send-meet-link", async (c) => {
  const { bookingId, meetLink } = await c.req.json();

  if (!bookingId || !meetLink) {
    return c.json({ error: "Booking ID and Meet link are required" }, 400);
  }

  // Fetch user details linked to the booking
  const booking = await db
    .select({
      userId: bookings.user_id,
      email: users.email,
    })
    .from(bookings)
    .innerJoin(users, eq(users.id, bookings.user_id))
    .where(eq(bookings.id, bookingId))
    .limit(1);

  if (!booking.length) {
    return c.json({ error: "Booking not found" }, 404);
  }

  const userEmail = booking[0].email;

  try {
    const info = await transporter.sendMail({
      from: `"Therapist" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: "Google Meet Link for Your Session",
      text: `Hello, your therapist has scheduled a Google Meet session. Join using this link: ${meetLink}`,
    });

    console.log("Email sent:", info.response);
    return c.json({ success: `Meet link sent to ${userEmail}` });
  } catch (error) {
    console.error("Email sending error:", error);
    return c.json({ error: "Failed to send email. Please try again later." }, 500);
  }
});
