
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    let next = searchParams.get('next') ?? '/'
    if (!next.startsWith('/')) {
      next = '/'
    }

    if (!code) {
      throw new Error('No code provided')
    }

    const supabase = await createClient()

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      throw error
    }

    if (!data.session) {
      throw new Error('No session in exchange response')
    }

    // Set session cookie
    const response = NextResponse.redirect(`${origin}${next}`)

    return response
  } catch (error) {
    return NextResponse.redirect(
      `${origin}/auth/auth-code-error?message=${encodeURIComponent(
        error instanceof Error ? error.message : 'Unknown error occurred'
      )}`
    )
  }
}
