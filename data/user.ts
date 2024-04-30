import { db } from "@/lib/db";

/* interface User {
  id: string;
  email: string;
  name: string | null;
  password: string | null; 
  emailVerified: boolean | null;
  image: string | null;
  _lastlogin: Date;
  _added: Date;
} */

export const getUserByEmail = async (email: string) => {
  try {
    const user = await db.user.findUnique({where: { email } });
    return user;
  } catch {
    return null;
  }
}

export const getUserById = async (id: string) => {
  try {
    const user = await db.user.findUnique({where: { id } });
    return user;
  } catch {
    return null;
  }
}