import sql from "@/lib/db";

export const getUserCount = async () => {
  const result = await sql`
    SELECT count(user_id) FROM users
  `;
  
  return Number(result.count);
};
