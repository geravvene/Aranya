import { NextRequest, NextResponse } from 'next/server'
import { validateLineSignature, replyMessage, getProfile } from '@/lib/line'

/**
 * POST /api/line/webhook
 *
 * Receives webhook events from LINE Platform.
 * - Validates the x-line-signature header.
 * - Handles: follow (send welcome), unfollow (log), message (echo/text reply).
 * - Always returns 200 OK to acknowledge receipt.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-line-signature') || ''

    // Validate signature (passes through if LINE is not configured)
    if (!validateLineSignature(body, signature)) {
      console.warn('[LINE Webhook] Invalid signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 200 }) // still 200 per LINE spec
    }

    const events = JSON.parse(body).events
    if (!events || events.length === 0) {
      return NextResponse.json({ ok: true })
    }

    for (const event of events) {
      switch (event.type) {
        case 'follow': {
          // User added the bot as a friend
          const userId = event.source?.userId
          if (userId) {
            console.log(`[LINE Webhook] New follower: ${userId}`)

            // Send welcome message
            await replyMessage(event.replyToken, [
              {
                type: 'text',
                text: '🌿 Welcome to ARANYA Botanical Dispensary & Lounge!\n\nUse this chat to browse our menu, ask questions, or get assistance from our budtenders.\n\nTap the LIFF menu button below to explore our full selection.',
              },
            ])

            // Try to fetch and log profile
            const profile = await getProfile(userId)
            if (profile) {
              console.log(`[LINE Webhook] Follower profile: ${profile.displayName} (${profile.userId})`)
            }
          }
          break
        }

        case 'unfollow': {
          const userId = event.source?.userId
          console.log(`[LINE Webhook] Unfollowed: ${userId || 'unknown'}`)
          break
        }

        case 'message': {
          const message = event.message
          if (message?.type === 'text') {
            const text = message.text?.toLowerCase().trim() || ''

            // Simple keyword responses
            let responseText = ''

            if (text.includes('menu') || text.includes('product') || text.includes('strain')) {
              responseText =
                '🌿 Browse our full menu here:\n\n' +
                (process.env.LIFF_URL
                  ? `${process.env.LIFF_URL}\n\n`
                  : '') +
                'Or visit us in person at ARANYA Bangkok.\n\n' +
                'Ask our budtender for recommendations!'
            } else if (text.includes('hello') || text.includes('hi') || text.includes('สวัสดี')) {
              responseText =
                '🙏 Sawadee krap! Welcome to ARANYA.\n\n' +
                'We are a premium botanical dispensary & lounge in Bangkok.\n' +
                'How can we assist you today?'
            } else if (text.includes('price') || text.includes('cost') || text.includes('ราคา')) {
              responseText =
                '💚 Our prices vary by product and quantity.\n\n' +
                'Please visit us in-store or check our digital menu for current pricing.\n' +
                'Our budtenders will be happy to help!'
            } else if (text.includes('location') || text.includes('where') || text.includes('ที่')) {
              responseText =
                '📍 ARANYA Bangkok\n' +
                'Botanical Dispensary & Lounge\n\n' +
                'Open daily. Contact us for exact location details.'
            } else {
              responseText =
                '🌿 Thank you for your message!\n\n' +
                'Our team will get back to you shortly.\n' +
                'In the meantime, check our menu or ask about our current specials.'
            }

            await replyMessage(event.replyToken, [
              { type: 'text', text: responseText },
            ])
          }
          break
        }

        default:
          console.log(`[LINE Webhook] Unhandled event type: ${event.type}`)
      }
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[LINE Webhook] Error:', error)
    // Always return 200 to prevent LINE from retrying
    return NextResponse.json({ ok: true })
  }
}

/**
 * GET /api/line/webhook — health check
 */
export async function GET() {
  return NextResponse.json({
    ok: true,
    service: 'LINE Webhook',
    configured: !!(process.env.LINE_CHANNEL_SECRET && process.env.LINE_CHANNEL_ACCESS_TOKEN),
  })
}