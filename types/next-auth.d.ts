import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: User & DefaultSession["user"],
  }

  interface User {
    role: String | null,
    shard: Int,
    emailSettings: JSON | null,
    bandsSettings: JSON | null,
    releaseSettings: JSON | null,
  }
}