import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: User & DefaultSession["user"],
  }

  interface User {
    userName: string | null,
    role: string | null,
    shard: number,
    location: string,
    notifications: string,
  }
}