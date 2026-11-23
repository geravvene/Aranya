import { NextRequest, NextResponse } from 'next/server'
import { getLoginAuthorizeUrl, getLoginProfile, upsertLineMember } from '@/lib/line'

/**
 * GET /api/line/login
 *
 * Initiates LINE Login OAuth flow.
 * Redirects the user to LINE's authorization page.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action') || 'authorize'

  // Health check
  if (action === 'status') {
    return NextResponse.json({
      ok: true,
      service: 'LINE Login',
      configured: !!(process.env.LINE_LOGIN_CHANNEL_ID && process.env.LINE_LOGIN_CHANNEL_SECRET),
    })
  }

  // Callback is handled by a separate GET with 'code' param
  const code = searchParams.get('code')
  if (code) {
    return handleCallback(request)
  }

  // Authorize: redirect to LINE
  const redirectUri = new URL('/api/line/login', request.url).toString()
  const state = crypto.randomUUID?.() || Math.random().toString(36).slice(2)

  const authorizeUrl = getLoginAuthorizeUrl(redirectUri, state)
  if (!authorizeUrl) {
    return NextResponse.json(
      { error: 'LINE Login not configured' },
      { status: 503 },
    )
  }

  return NextResponse.redirect(authorizeUrl)
}

/**
 * Handle the OAuth callback from LINE.
 * Exchanges the code for a token, fetches the profile,
 * and creates/updates a Member record.
 */
async function handleCallback(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')

  if (!code) {
    return NextResponse.json({ error: 'Missing authorization code' }, { status: 400 })
  }

  const redirectUri = new URL('/api/line/login', request.url).toString()

  const profile = await getLoginProfile(code, redirectUri)
  if (!profile) {
    return NextResponse.json(
      { error: 'Failed to authenticate with LINE' },
      { status: 401 },
    )
  }

  // Create or update member in database
  const member = await upsertLineMember(profile)

  // Redirect to home page with success indicator
  const homeUrl = new URL('/', request.url)
  homeUrl.searchParams.set('line_login', 'success')
  if (member) {
    homeUrl.searchParams.set('line_user', profile.displayName)
  }

  return NextResponse.redirect(homeUrl)
}