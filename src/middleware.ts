import { NextResponse } from 'next/server'

// Generate a random nonce using Web Crypto API
function generateNonce() {
  const array = new Uint8Array(16)
  crypto.getRandomValues(array)
  return btoa(String.fromCharCode(...array))
}

export function middleware() {
  console.log('Middleware running...');
  const response = NextResponse.next()
  const headers = response.headers
  const nonce = generateNonce()

  // Store nonce in response headers for use in templates
  headers.set('X-CSP-Nonce', nonce)

  // Determine if we're in development
  const isDevelopment = process.env.NODE_ENV === 'development'

  // Base CSP directives
  const cspDirectives = {
    'default-src': ["'self'"],
    'script-src': [
      "'self'",
      `'nonce-${nonce}'`,
      'https://accounts.google.com'
    ],
    'style-src': [
      "'self'",
      `'nonce-${nonce}'`,
      'https://fonts.googleapis.com'
    ],
    'img-src': ["'self'", 'data:', 'https:', 'blob:'],
    'font-src': ["'self'", 'https://fonts.gstatic.com'],
    'connect-src': [
      "'self'",
      'https://api.spotify.com',
      'https://accounts.spotify.com',
      'https://accounts.google.com'
    ],
    'frame-src': ["'self'", 'https://accounts.google.com'],
    'report-uri': ['/api/csp-report'], // Endpoint to receive CSP violation reports
    'report-to': ['csp-endpoint'], // Modern reporting API endpoint
  }

  // Convert CSP directives to string
  const cspString = Object.entries(cspDirectives)
    .map(([key, values]) => `${key} ${values.join(' ')}`)
    .join('; ')

  // Set CSP header based on environment
  if (isDevelopment) {
    // In development, use report-only mode
    headers.set('Content-Security-Policy-Report-Only', cspString)
  } else {
    // In production, use strict CSP
    headers.set('Content-Security-Policy', cspString)
  }

  // Other security headers
  headers.set('X-DNS-Prefetch-Control', 'on')
  headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  headers.set('X-Frame-Options', 'SAMEORIGIN')
  headers.set('X-Content-Type-Options', 'nosniff')
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

  return response
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
} 