import { createServerClient, type CookieOptions } from '@supabase/ssr'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export async function middleware(req: NextRequest) {
  let res = NextResponse.next({
    request: {
      headers: req.headers,
    },
  })

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  const supabase = createServerClient(url || '', anonKey || '', {
    cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          req.cookies.set({ name, value, ...options })
          res = NextResponse.next({
            request: {
              headers: req.headers,
            },
          })
          res.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          req.cookies.set({ name, value: '', ...options })
          res = NextResponse.next({
            request: {
              headers: req.headers,
            },
          })
          res.cookies.set({ name, value: '', ...options })
        },
      },
    },
  )

  // This will also refresh the session if it's expired
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = req.nextUrl

  // Protected routes that require authentication
  const protectedRoutes = ['/profile', '/watchlist']

  // Routes to redirect authenticated users away from
  const authRoutes = ['/auth/login', '/auth/signup', '/auth/verify']

  // Check if user is trying to access protected routes
  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    if (!user) {
      // User is not authenticated, redirect to login
      const redirectUrl = req.nextUrl.clone()
      redirectUrl.pathname = '/auth/login'
      redirectUrl.searchParams.set('redirectedFrom', pathname)
      return NextResponse.redirect(redirectUrl)
    }
  }

  // Check if authenticated user is trying to access auth routes
  if (authRoutes.includes(pathname) && user) {
    // User is authenticated, redirect to profile
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/profile'
    return NextResponse.redirect(redirectUrl)
  }

  return res
}

export const config = {
  matcher: [
    '/profile',
    '/profile/:path*',
    '/watchlist',
    '/watchlist/:path*',
    '/auth/login',
    '/auth/signup',
    '/auth/verify',
  ],
}
