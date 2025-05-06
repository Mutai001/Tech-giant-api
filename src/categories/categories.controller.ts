//users.controller.ts
import { Context } from "hono";
import { usersService, getuserservice, createuserservice, updateuserservice, deleteuserservice } from "./users.service";
import * as bcrypt from "bcrypt";

export const listUsers = async (c: Context) => {
  try {
    const limit = Number(c.req.query("limit"));
    const data = await usersService(limit);
    if (data == null || data.length === 0) {
      return c.text("User not found", 404);
    }
    return c.json(data, 200);
  } catch (error: any) {
    return c.json({ error: error?.message }, 400);
  }
};

export const getUser = async (c: Context) => {
  const id = parseInt(c.req.param("id"));
  if (isNaN(id)) return c.text("Invalid ID", 400);

  const user = await getuserservice(id);
  if (user === undefined) {
    return c.text("User not found", 404);
  }
  return c.json(user, 200);
};

export const createUser = async (c: Context) => {
  try {
    const user = await c.req.json();
    const password = user.password;
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    const createduser = await createuserservice(user);

    if (!createduser) return c.text("User not created", 404);
    return c.json({ msg: createduser }, 201);
  } catch (error: any) {
    return c.json({ error: error?.message }, 400);
  }
};

export const updateUser = async (c: Context) => {
  const id = parseInt(c.req.param("id"));
  if (isNaN(id)) return c.text("Invalid ID", 400);

  const user = await c.req.json();
  try {
    const searcheduser = await getuserservice(id);
    if (searcheduser === undefined) return c.text("User not found", 404);

    const res = await updateuserservice(id, user);

    if (!res) return c.text("User not updated", 404);

    return c.json({ msg: res }, 201);
  } catch (error: any) {
    return c.json({ error: error?.message }, 400);
  }
};

export const deleteUser = async (c: Context) => {
  const id = Number(c.req.param("id"));
  if (isNaN(id)) return c.text("Invalid ID", 400);

  try {
    const user = await getuserservice(id);
    if (user === undefined) return c.text("User not found", 404);

    const res = await deleteuserservice(id);
    if (!res) return c.text("User not deleted", 404);

    return c.json({ msg: res }, 201);
  } catch (error: any) {
    return c.json({ error: error?.message }, 400);
  }
};
