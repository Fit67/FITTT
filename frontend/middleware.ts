import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Next.js Edge Middleware — fast UX gate for admin routes.
 *
 * PURPOSE:
 *   Prevent unauthorized users from seeing ANY admin UI before React renders.
 *   This is purely a UX optimization (no flash of admin content).
 *
 * SECURITY NOTE:
 *   This middleware does NOT perform JWT verification or role checking.
 *   The backend API (`authenticate` + `authorize`) is the sole source of truth.
 *   This middleware only checks for the *presence* of a token cookie as a
 *   fast-reject heuristic. A tampered or expired cookie will pass this gate
 *   but will be rejected by the backend + the client-side layout auth guard.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Only gate /admin routes
  if (!pathname.startsWith('/admin')) {
    return NextResponse.next()
  }

  // Check for the presence of the access token cookie
  const token = request.cookies.get('accessToken')?.value

  if (!token) {
    // No token at all → redirect to login
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Token cookie exists → allow through to the client-side layout guard
  // which will verify auth state and role via Zustand store + API
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
