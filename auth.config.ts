import type { NextAuthConfig } from "next-auth";
console.log(process.env.AUTH_SECRET);
console.log(process.env);

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  secret: process.env.AUTH_SECRET,
  callbacks: {
    authorized({ auth, request: { nextUrl }}) {
      const isLoggedIn = !!auth?.user;
      const isOnAllowedRoutes = ['/home', '/releases', '/events', '/recommendations'].some(route => nextUrl.pathname.startsWith(route));
      const isOnProfilePage = nextUrl.pathname.startsWith('/profile');
  
      if (isOnAllowedRoutes) {
        // Always authorize access to the allowed routes
        return true;
      } else if (isOnProfilePage && !isLoggedIn) {
        // If the user is not logged in and they're trying to access the profile page,
        // redirect them to the login page
        return Response.redirect('/login');
      } else if (isLoggedIn) {
        // If the user is logged in, allow access
        return true;
      }
      // If the user is not logged in and they're not on an allowed route,
      // authorize access (this will depend on your app's requirements)
      return true;
    }
  },
  providers: []
} satisfies NextAuthConfig;
