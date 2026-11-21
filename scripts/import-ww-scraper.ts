/**
 * Import Weed Walker legacy data from ww-scraper JSON files into Aranya database.
 *
 * Usage:
 *   npx ts-node --compiler-options '{"module":"commonjs"}' scripts/import-ww-scraper.ts
 *
 * This script reads:
 *   - ww-scraper/data/members.json   → Member records
 *   - ww-scraper/data/transactions.json (if exists) → Transaction records
 *
 * It upserts by phone (members) and receiptNumber (transactions) so it is
 * safe to run multiple times without creating duplicates.
 */

import { PrismaClient } from '@prisma/client'
import * as path from 'path'
import * as fs from 'fs'

const prisma = new PrismaClient()

const DATA_DIR = path.join(__dirname, '..', 'ww-scraper', 'data')
const MEMBERS_FILE = path.join(DATA_DIR, 'members.json')
const TRANSACTIONS_FILE = path.join(DATA_DIR, 'transactions.json')

function loadJSON(file: string): any[] {
  try {
    if (!fs.existsSync(file)) return []
    return JSON.parse(fs.readFileSync(file, 'utf8'))
  } catch {
    return []
  }
}

async function importMembers() {
  const raw = loadJSON(MEMBERS_FILE)
  if (raw.length === 0) {
    console.log('⚠️  No members found in ww-scraper data (members.json is empty).')
    return 0
  }

  let imported = 0
  for (const m of raw) {
    const phone = m.phone || undefined
    const data = {
      name: m.name || 'Unknown',
      channel: m.channel || null,
      dob: m.dob || null,
      phone: phone || null,
      email: m.email || null,
      firstVisit: m.first_visit ? new Date(m.first_visit) : null,
      lastVisit: m.last_visit ? new Date(m.last_visit) : null,
      points: m.points || 0,
      tier: m.tier || 'bronze',
      notes: m.notes || null,
      syncedAt: m.synced_at ? new Date(m.synced_at) : new Date(),
    }

    if (phone) {
      // Upsert by phone (unique)
      const existing = await prisma.member.findUnique({ where: { phone } })
      if (existing) {
        await prisma.member.update({ where: { phone }, data })
      } else {
        await prisma.member.create({ data: { ...data, phone } })
      }
    } else {
      // No phone — create new record
      await prisma.member.create({ data })
    }
    imported++
  }

  console.log(`✅ Imported / updated ${imported} members`)
  return imported
}

async function importTransactions() {
  const raw = loadJSON(TRANSACTIONS_FILE)
  if (raw.length === 0) {
    console.log('ℹ️  No transactions file found or empty — skipping.')
    return 0
  }

  let imported = 0
  for (const t of raw) {
    const receiptNumber = t.receipt_number
    if (!receiptNumber) continue

    // Try to find member by name
    let memberId: string | null = null
    if (t.member_name) {
      const member = await prisma.member.findFirst({
        where: { name: t.member_name },
      })
      if (member) memberId = member.id
    }

    const data = {
      txDate: t.tx_date ? new Date(t.tx_date) : new Date(),
      memberId,
      memberName: t.member_name || 'Walk-in',
      receiptNumber,
      status: t.status || 'completed',
      amount: t.amount || 0,
      pointsEarned: t.points_earned || 0,
      txType: t.tx_type || 'sale',
      syncedAt: t.synced_at ? new Date(t.synced_at) : new Date(),
    }

    const existing = await prisma.transaction.findUnique({ where: { receiptNumber } })
    if (existing) {
      await prisma.transaction.update({ where: { receiptNumber }, data })
    } else {
      await prisma.transaction.create({ data })
    }
    imported++
  }

  console.log(`✅ Imported / updated ${imported} transactions`)
  return imported
}

async function main() {
  console.log('🔄 Importing Weed Walker legacy data...')
  console.log(`   Data directory: ${DATA_DIR}`)

  const memberCount = await importMembers()
  const txCount = await importTransactions()

  console.log('')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`📊 Summary: ${memberCount} members, ${txCount} transactions`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
}

main()
  .catch((e) => {
    console.error('Import failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })