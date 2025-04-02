import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define public routes that don't require authentication
const publicRoutes = [
  '/',                    // Homepage
  '/signin',              // Sign in page
  '/api/auth/google',     // Google auth routes
  '/api/auth/spotify',    // Spotify auth routes
  '/api/auth/session',    // Session check endpoint
  '/api/csp-report',      // CSP reporting endpoint
  '/favicon.ico',         // Favicon
  '/_next',              // Next.js internal routes
  '/static',             // Static files
]

// Define routes that require authentication
const protectedRoutes = [
  '/profile',           // User profile
  '/settings',          // User settings
  '/api/users',         // User API endpoints
]

export function authMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip auth check for public routes
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  
  // If it's not a protected route, allow access
  if (!isProtectedRoute) {
    return NextResponse.next()
  }

  // For protected routes, check authentication
  const sessionCookie = request.cookies.get('iron-session')
  
  if (!sessionCookie) {
    // Redirect to sign in page if not authenticated
    const signInUrl = new URL('/signin', request.url)
    signInUrl.searchParams.set('from', pathname) // Store the original URL to redirect back after login
    
    return NextResponse.redirect(signInUrl)
  }

  return NextResponse.next()
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
} 