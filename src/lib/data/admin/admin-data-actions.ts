"use server";

import { sql } from "@/lib/db";

export const testSqlQuery = async (id: string) => {
  const user = await sql`
  SELECT * from users where id = ${id} limit 1
  `;
  console.log("server side user", user);
  return user[0];
};
