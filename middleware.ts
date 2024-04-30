import NextAuth from "next-auth"
import authConfig from "./auth.config"
import { DEFAULT_LOGIN_REDIRECT, apiAuthPrefix, authRoutes, publicRoutes } from "@/routes"
 
const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const { nextUrl} = req; 
  const isLoggedIn = !!req.auth;

  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);
  console.log({
    "Logged in": isLoggedIn,
    "isApiAuthRoute": isApiAuthRoute,
    "isPublicRoute": isPublicRoute,
    "nextUrl.pathname": nextUrl.pathname,
    "isAuthRoute": isAuthRoute
  });

  if (isApiAuthRoute) {
    return;
  }
  
  if (isAuthRoute) {
    if (isLoggedIn) {
      return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
    }
    return;
  }
// This should route user back to login if they're trying to access non-public routes
/* const isNextAuthRoute = nextUrl.pathname.startsWith("/api/auth/");

if (!isLoggedIn && !isPublicRoute && !isNextAuthRoute && !nextUrl.pathname.startsWith("/auth/login")) {
  console.log("Redirecting to login");
  return Response.redirect(new URL("/auth/login", nextUrl));
} */

  return;
})
 
export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
}