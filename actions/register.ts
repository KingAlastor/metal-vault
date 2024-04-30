"use server";

import * as z from "zod";
import { RegisterSchema } from "@/schemas";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { getUserByEmail } from "@/data/user";

export const register = async (values: z.infer<typeof RegisterSchema>) => {
  const validateFields = RegisterSchema.safeParse(values);

  if (!validateFields.success) {
    return { error: "Invalid fields" };
  }

  const {email, password, name} = validateFields.data;
  const hashedPassword = await bcrypt.hash(password, 10);

  const existingUser = await getUserByEmail(email);

  if (existingUser) { 
    return { error: "Email already in use" };
  }

  try {
    await db.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });
  } catch (error) {
    console.error(error);
    // Handle the error as needed
  }

  // TODO: Send verification token email

  return { success: "User created" };
};
