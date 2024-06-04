"use client";

import { signOut } from "next-auth/react"
 
export function SignOut() {
  //this should be update to User Button instead
  return <button onClick={() => signOut()}>Sign Out</button>
}