/*  This is used to refresh session expiry date on every page load.
 Does not work with the current version of next-auth.

 Middleware doesn't share user data either, so no need to authenticate user here */


export { auth as middleware } from "@/auth"