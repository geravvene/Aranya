import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { usingFallback, getCategories, getProducts } from '@/lib/store'

/**
 * GET /api/line/liff
 *
 * Returns menu data for the LIFF (LINE Frontend Framework) mini-app.
 * LIFF is an embedded web app that runs inside LINE.
 *
 * Response includes:
 * - categories: all product categories
 * - products: all products with full details
 * - settings: brand info and display settings
 * - line: LINE OA and LIFF URLs
 */
export async function GET(request: NextRequest) {
  try {
    let categories, products

    if (usingFallback()) {
      categories = await getCategories()
      products = await getProducts()
    } else {
      categories = await prisma.category.findMany({
        orderBy: { order: 'asc' },
      })
      products = await prisma.product.findMany({
        include: { category: true },
        orderBy: { createdAt: 'desc' },
      })
    }

    const data = {
      ok: true,
      categories,
      products,
      settings: {
        brandTitle: 'ARANYA',
        brandSubtitle: 'Botanical Dispensary & Lounge',
        location: 'Bangkok, Thailand',
        currency: 'THB',
        locale: 'en',
      },
      line: {
        oaQrUrl: process.env.LINE_OA_QR_URL || '',
        liffUrl: process.env.LIFF_URL || '',
        loginUrl: '/api/line/login',
      },
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('[LINE LIFF] Error fetching data:', error)
    return NextResponse.json(
      {
        ok: false,
        error: 'Failed to load menu data',
        categories: [],
        products: [],
        settings: {
          brandTitle: 'ARANYA',
          brandSubtitle: 'Botanical Dispensary & Lounge',
          location: 'Bangkok, Thailand',
          currency: 'THB',
          locale: 'en',
        },
        line: {
          oaQrUrl: process.env.LINE_OA_QR_URL || '',
          liffUrl: process.env.LIFF_URL || '',
          loginUrl: '/api/line/login',
        },
      },
      { status: 200 },
    )
  }
}