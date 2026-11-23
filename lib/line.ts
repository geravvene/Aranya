/**
 * LINE Messaging API, Login & LIFF integration module.
 *
 * All functions gracefully fall back to no-ops when LINE environment
 * variables are not configured, so the app works without LINE.
 */

import { LineBotClient, validateSignature } from '@line/bot-sdk'
import { prisma } from '@/lib/db'
import { usingFallback, upsertMember as storeUpsertMember } from '@/lib/store'

// ─── Environment helpers ───

const channelSecret = process.env.LINE_CHANNEL_SECRET || ''
const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN || ''
const loginChannelId = process.env.LINE_LOGIN_CHANNEL_ID || ''
const loginChannelSecret = process.env.LINE_LOGIN_CHANNEL_SECRET || ''

// LINE_OA_QR_URL доступен и на сервере, и на клиенте (через NEXT_PUBLIC_)
export const LINE_OA_QR_URL =
  process.env.NEXT_PUBLIC_LINE_OA_QR_URL || process.env.LINE_OA_QR_URL || ''

export const LIFF_URL = process.env.NEXT_PUBLIC_LIFF_URL || process.env.LIFF_URL || ''

function isConfigured(): boolean {
  return !!(channelSecret && channelAccessToken)
}

function isLoginConfigured(): boolean {
  return !!(loginChannelId && loginChannelSecret)
}

// ─── LINE Messaging Client (lazy init) ───

let _client: LineBotClient | null = null

function getClient(): LineBotClient | null {
  if (!isConfigured()) return null
  if (!_client) {
    _client = LineBotClient.fromChannelAccessToken({
      channelAccessToken,
    })
  }
  return _client
}

// ─── Signature validation ───

/**
 * Validate the x-line-signature header against the request body.
 * Returns true if valid or if LINE is not configured (graceful fallback).
 */
export function validateLineSignature(body: string, signature: string): boolean {
  if (!isConfigured()) return true // no-op fallback
  try {
    return validateSignature(body, channelSecret, signature)
  } catch {
    return false
  }
}

// ─── Push message ───

export async function sendPushMessage(
  to: string,
  messages: any[],
): Promise<boolean> {
  const client = getClient()
  if (!client) return false
  try {
    await client.pushMessage({ to, messages } as any)
    return true
  } catch (error) {
    console.error('[LINE] pushMessage error:', error)
    return false
  }
}

// ─── Reply message ───

export async function replyMessage(
  replyToken: string,
  messages: any[],
): Promise<boolean> {
  const client = getClient()
  if (!client) return false
  try {
    await client.replyMessage({ replyToken, messages } as any)
    return true
  } catch (error) {
    console.error('[LINE] replyMessage error:', error)
    return false
  }
}

// ─── Get profile ───

export async function getProfile(userId: string) {
  const client = getClient()
  if (!client) return null
  try {
    return await client.getProfile(userId)
  } catch (error) {
    console.error('[LINE] getProfile error:', error)
    return null
  }
}

// ─── LINE Login helpers ───

/**
 * Build the LINE Login authorize URL.
 */
export function getLoginAuthorizeUrl(redirectUri: string, state: string): string {
  if (!isLoginConfigured()) return ''
  const base = 'https://access.line.me/oauth2/v2.1/authorize'
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: loginChannelId,
    redirect_uri: redirectUri,
    state,
    scope: 'profile openid email',
  })
  return `${base}?${params.toString()}`
}

/**
 * Exchange authorization code for an access token and fetch the user profile.
 * Returns the LINE profile on success, or null on failure.
 */
export async function getLoginProfile(
  code: string,
  redirectUri: string,
): Promise<{ userId: string; displayName: string; pictureUrl?: string; email?: string } | null> {
  if (!isLoginConfigured()) return null

  try {
    // Exchange code for token
    const tokenRes = await fetch('https://api.line.me/oauth2/v2.1/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: loginChannelId,
        client_secret: loginChannelSecret,
      }),
    })

    if (!tokenRes.ok) {
      console.error('[LINE Login] token exchange failed:', tokenRes.status)
      return null
    }

    const tokenData = await tokenRes.json()
    const accessToken = tokenData.access_token
    if (!accessToken) return null

    // Fetch profile
    const profileRes = await fetch('https://api.line.me/v2/profile', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    if (!profileRes.ok) {
      console.error('[LINE Login] profile fetch failed:', profileRes.status)
      return null
    }

    const profile = await profileRes.json()
    return {
      userId: profile.userId,
      displayName: profile.displayName,
      pictureUrl: profile.pictureUrl,
      email: tokenData.email,
    }
  } catch (error) {
    console.error('[LINE Login] error:', error)
    return null
  }
}

/**
 * Create or update a Member record from a LINE Login profile.
 * Works with both Prisma and fallback store.
 */
export async function upsertLineMember(profile: {
  userId: string
  displayName: string
  pictureUrl?: string
  email?: string
}) {
  const data = {
    name: profile.displayName,
    channel: `line:${profile.userId}`,
    email: profile.email || null,
  }

  if (usingFallback()) {
    // Fallback in-memory store
    return storeUpsertMember(data)
  }

  try {
    // Check if member with this LINE userId already exists
    const existing = await prisma.member.findFirst({
      where: { channel: `line:${profile.userId}` },
    })

    if (existing) {
      return await prisma.member.update({
        where: { id: existing.id },
        data: { ...data, updatedAt: new Date() },
      })
    }

    return await prisma.member.create({ data } as any)
  } catch (error) {
    console.error('[LINE] upsertLineMember error:', error)
    return null
  }
}