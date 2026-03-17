import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const { pathname } = req.nextUrl

  // Protected routes that require authentication
  const protectedRoutes = ['/profile', '/watchlist']

  // Routes to redirect authenticated users away from
  const authRoutes = ['/auth/login', '/auth/signup', '/auth/verify']

  // Check if user has auth token in cookies (simple cookie-based check)
  const authToken = req.cookies.get(
    'sb-nvevbwcufxmkqazbnxgw-auth-token.0',
  )?.value

  // Check if user is trying to access protected routes
  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    if (!authToken) {
      // User is not authenticated, redirect to login
      const redirectUrl = req.nextUrl.clone()
      redirectUrl.pathname = '/auth/login'
      redirectUrl.searchParams.set('redirectedFrom', pathname)
      return NextResponse.redirect(redirectUrl)
    }
  }

  // Check if authenticated user is trying to access auth routes
  if (authRoutes.includes(pathname) && authToken) {
    // User is authenticated, redirect to profile
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/profile'
    return NextResponse.redirect(redirectUrl)
  }

  return res
}

export const config = {
  matcher: [
    '/profile/:path*',
    '/watchlist/:path*',
    '/auth/login',
    '/auth/signup',
    '/auth/verify',
  ],
}
