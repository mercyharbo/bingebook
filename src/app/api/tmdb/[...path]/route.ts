import { NextRequest, NextResponse } from 'next/server'

type RouteContext = {
  params: Promise<{
    path: string[]
  }>
}

export async function GET(request: NextRequest, context: RouteContext) {
  const apiKey = process.env.TMDB_API_KEY
  const baseUrl = process.env.TMDB_BASE_URL

  if (!apiKey || !baseUrl) {
    return NextResponse.json(
      { error: 'TMDB server configuration is missing' },
      { status: 500 },
    )
  }

  const { path } = await context.params
  const tmdbPath = path.map(encodeURIComponent).join('/')
  const targetUrl = new URL(tmdbPath, `${baseUrl.replace(/\/$/, '')}/`)
  targetUrl.search = request.nextUrl.search

  try {
    const response = await fetch(targetUrl, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    })

    const body = await response.json()

    return NextResponse.json(body, { status: response.status })
  } catch (error) {
    console.error('TMDB proxy request failed:', error)

    return NextResponse.json(
      { error: 'Failed to fetch TMDB data' },
      { status: 502 },
    )
  }
}
