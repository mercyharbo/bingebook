import { createServerClient } from '@supabase/ssr'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll().map((cookie) => ({
            name: cookie.name,
            value: cookie.value,
          }))
        },
        setAll(cookies) {
          cookies.forEach((cookie) => {
            res.cookies.set(cookie.name, cookie.value, cookie.options)
          })
        },
      },
    }
  )

  let user = null
  let authError = null

  try {
    // Manually extract tokens from cookies
    const tokenCookie0 = req.cookies.get(
      'sb-nvevbwcufxmkqazbnxgw-auth-token.0'
    )?.value
    const tokenCookie1 = req.cookies.get(
      'sb-nvevbwcufxmkqazbnxgw-auth-token.1'
    )?.value

    if (tokenCookie0 && tokenCookie1) {
      // Remove 'base64-' prefix and combine cookies
      const tokenStr =
        tokenCookie0.replace(/^base64-/, '') + (tokenCookie1 || '')
      try {
        const sessionData = JSON.parse(tokenStr)
        const { access_token, refresh_token } = sessionData

        if (access_token && refresh_token) {
          // Set session with extracted tokens
          await supabase.auth.setSession({
            access_token,
            refresh_token,
          })
        }
      } catch (parseError) {
        authError = parseError
      }
    }

    // Fetch user
    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession()
    if (sessionError) {
      authError = sessionError
    } else if (sessionData.session) {
      const { data, error } = await supabase.auth.getUser()
      user = data.user
      authError = error
    }
  } catch (error) {
    authError = error
  }

  const { pathname } = req.nextUrl

  // Protected routes that require authentication
  const protectedRoutes = ['/profile', '/watchlist']

  // Routes to redirect authenticated users away from
  const authRoutes = ['/auth/login', '/auth/signup', '/auth/verify']

  // Check if user is trying to access protected routes
  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    if (!user || authError) {
      // User is not authenticated, redirect to login
      const redirectUrl = req.nextUrl.clone()
      redirectUrl.pathname = '/auth/login'
      redirectUrl.searchParams.set('redirectedFrom', pathname)
      return NextResponse.redirect(redirectUrl)
    }
  }

  // Check if authenticated user is trying to access auth routes
  if (authRoutes.includes(pathname) && user && !authError) {
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
