/**
 * WeedWalker — Silompos Scraper v2
 */

const { chromium } = require('playwright')
const cron = require('node-cron')
const chalk = require('chalk')
const path = require('path')
const fs = require('fs')

const GOOGLE_EMAIL = 'weedwalker.th@gmail.com'
const DATA_DIR = path.join(__dirname, 'data')
const MEMBERS_FILE = path.join(DATA_DIR, 'members.json')
const TRANSACTIONS_FILE = path.join(DATA_DIR, 'transactions.json')
const LOG_FILE = path.join(DATA_DIR, 'sync_log.json')

const URLS = {
  memberList:   'https://dashboard.silompos.com/member/data',
  transactions: 'https://crm.silompos.com/transaction/history',
  loginStart:   'https://crm.silompos.com/',
}

fs.mkdirSync(DATA_DIR, { recursive: true })

function loadJSON(file) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')) } catch { return [] }
}
function saveJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8')
}
function log(msg, type = 'info') {
  const now = new Date().toLocaleString('th-TH')
  const colors = { info: 'cyan', ok: 'green', warn: 'yellow', error: 'red' }
  console.log(chalk[colors[type] || 'white'](`[${now}] ${msg}`))
}
function saveLog(type, status, count, message) {
  const logs = loadJSON(LOG_FILE)
  logs.unshift({ type, status, count, message, synced_at: new Date().toISOString() })
  saveJSON(LOG_FILE, logs.slice(0, 100))
}

async function isLoggedIn(page) {
  const url = page.url()
  // ถ้า url มี google = ยังไม่ได้ login
  if (url.includes('accounts.google.com')) return false
  if (url.includes('google.com/signin')) return false
  // ลองหา element ที่บ่งบอกว่า login แล้ว
  try {
    const loggedIn = await page.$('[class*="navbar"], [class*="sidebar"], [class*="dashboard"], nav, .container')
    return !!loggedIn
  } catch { return false }
}

async function waitForLogin(page) {
  log('════════════════════════════════════════', 'warn')
  log('  🔐 กรุณา Login Google ในหน้าต่าง Browser', 'warn')
  log(`  บัญชี: ${GOOGLE_EMAIL}`, 'warn')
  log('  หลัง Login เสร็จ ระบบจะทำงานอัตโนมัติ', 'warn')
  log('════════════════════════════════════════', 'warn')

  // รอสูงสุด 5 นาที และเช็คทุก 3 วินาที
  const maxWait = 300000 // 5 นาที
  const interval = 3000
  const start = Date.now()

  while (Date.now() - start < maxWait) {
    await page.waitForTimeout(interval)
    const url = page.url()
    const remaining = Math.round((maxWait - (Date.now() - start)) / 1000)
    log(`  ⏳ รอ Login... (เหลือ ${remaining} วินาที) URL: ${url.substring(0, 50)}`, 'warn')

    if (!url.includes('accounts.google.com') && !url.includes('google.com/signin')) {
      // รอให้หน้าโหลดเสร็จ
      await page.waitForTimeout(3000)
      log('✅ Login สำเร็จ!', 'ok')
      return true
    }
  }
  throw new Error('Login timeout — กรุณารัน npm start ใหม่แล้ว Login ให้เร็วขึ้น')
}

async function scrapeMembers(page) {
  log('📋 เริ่ม scrape รายชื่อสมาชิก...', 'info')
  await page.goto(URLS.memberList, { waitUntil: 'networkidle', timeout: 30000 })
  await page.waitForTimeout(2000)

  let totalPages = 1
  try {
    const bodyText = await page.textContent('body')
    const match = bodyText.match(/of\s+([\d,]+)\s+entries/)
    if (match) {
      const total = parseInt(match[1].replace(',', ''))
      totalPages = Math.ceil(total / 50)
      log(`   พบสมาชิก ${total} คน (${totalPages} หน้า)`, 'info')
    }
  } catch (e) {}

  const existing = loadJSON(MEMBERS_FILE)
  const memberMap = {}
  existing.forEach(m => { if (m.phone) memberMap[m.phone] = m })

  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    log(`   หน้า ${pageNum}/${totalPages}`, 'info')

    if (pageNum > 1) {
      try {
        // คลิกปุ่ม Next
        await page.click('ul.pagination li:last-child a, a[aria-label="Next page"], .next a')
        await page.waitForTimeout(1500)
      } catch (e) {
        log(`   ข้ามหน้า ${pageNum} ไม่ได้: ${e.message}`, 'warn')
        continue
      }
    }

    try {
      const rows = await page.$$eval('table tbody tr', rows =>
        rows.map(row => {
          const cells = Array.from(row.querySelectorAll('td'))
          return {
            name:        cells[1]?.innerText?.trim(),
            channel:     cells[2]?.innerText?.trim(),
            dob:         cells[3]?.innerText?.trim(),
            phone:       cells[4]?.innerText?.trim(),
            email:       cells[5]?.innerText?.trim(),
            first_visit: cells[6]?.innerText?.trim(),
            last_visit:  cells[7]?.innerText?.trim(),
            synced_at:   new Date().toISOString(),
          }
        }).filter(r => r.name && r.name.length > 0)
      )
      rows.forEach(m => { if (m.phone) memberMap[m.phone] = m; else memberMap[m.name + '_' + pageNum] = m })
      log(`   ✓ ${rows.length} คน`, 'ok')
    } catch (e) {
      log(`   ⚠ หน้า ${pageNum}: ${e.message}`, 'warn')
    }

    await page.waitForTimeout(600)
  }

  const all = Object.values(memberMap)
  saveJSON(MEMBERS_FILE, all)
  log(`✅ บันทึกสมาชิกรวม ${all.length} คน → ${MEMBERS_FILE}`, 'ok')
  saveLog('members', 'success', all.length, `Scraped ${all.length} members`)
}

async function scrapeTransactions(page) {
  log('💳 เริ่ม scrape Transaction...', 'info')
  await page.goto(URLS.transactions, { waitUntil: 'networkidle', timeout: 30000 })
  await page.waitForTimeout(2000)

  let totalPages = 1
  try {
    const lastBtn = await page.$('ul.pagination li:last-child a')
    if (lastBtn) totalPages = parseInt(await lastBtn.textContent()) || 1
    log(`   พบ ${totalPages} หน้า`, 'info')
  } catch (e) {}

  const existing = loadJSON(TRANSACTIONS_FILE)
  const txMap = {}
  existing.forEach(t => { if (t.receipt_number) txMap[t.receipt_number] = t })

  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    log(`   หน้า ${pageNum}/${totalPages}`, 'info')

    if (pageNum > 1) {
      try {
        await page.click('ul.pagination li:last-child a, a[aria-label="Next page"], .next a')
        await page.waitForTimeout(1200)
      } catch (e) { continue }
    }

    try {
      const rows = await page.$$eval('table tbody tr', rows =>
        rows.map(row => {
          const cells = Array.from(row.querySelectorAll('td'))
          return {
            tx_date:        cells[1]?.innerText?.trim(),
            member_name:    cells[2]?.innerText?.trim(),
            receipt_number: cells[3]?.innerText?.trim(),
            status:         cells[4]?.innerText?.trim(),
            amount:         parseFloat((cells[5]?.innerText || '0').replace(/,/g,'')) || 0,
            points_earned:  parseInt(cells[6]?.innerText) || 0,
            tx_type:        cells[7]?.innerText?.trim(),
            synced_at:      new Date().toISOString(),
          }
        }).filter(r => r.tx_date && r.tx_date.length > 0)
      )
      rows.forEach(t => { if (t.receipt_number) txMap[t.receipt_number] = t })
      log(`   ✓ ${rows.length} รายการ`, 'ok')
    } catch (e) {
      log(`   ⚠ หน้า ${pageNum}: ${e.message}`, 'warn')
    }

    await page.waitForTimeout(600)
  }

  const all = Object.values(txMap)
  saveJSON(TRANSACTIONS_FILE, all)
  log(`✅ บันทึก Transaction รวม ${all.length} รายการ → ${TRANSACTIONS_FILE}`, 'ok')
  saveLog('transactions', 'success', all.length, `Scraped ${all.length} transactions`)
}

let isRunning = false

async function runSync() {
  if (isRunning) { log('⚠ กำลัง sync อยู่ ข้ามรอบนี้', 'warn'); return }
  isRunning = true
  log('🚀 เริ่ม Sync...', 'info')

  const userDataDir = path.join(__dirname, '.browser-session')
  fs.mkdirSync(userDataDir, { recursive: true })

  let context
  try {
    context = await chromium.launchPersistentContext(userDataDir, {
      headless: false,
      args: ['--start-maximized', '--disable-blink-features=AutomationControlled'],
      viewport: null,
      ignoreHTTPSErrors: true,
    })

    const page = await context.newPage()
    log('🌐 เปิด Browser แล้ว — กำลังโหลด silompos...', 'info')

    await page.goto(URLS.loginStart, { waitUntil: 'domcontentloaded', timeout: 30000 })
    await page.waitForTimeout(3000)

    const loggedIn = await isLoggedIn(page)
    if (!loggedIn) {
      await waitForLogin(page)
    } else {
      log('✅ ใช้ session เดิมได้', 'ok')
    }

    await scrapeMembers(page)
    await scrapeTransactions(page)

    const members = loadJSON(MEMBERS_FILE)
    const txs = loadJSON(TRANSACTIONS_FILE)
    log('', 'info')
    log('📊 สรุป:', 'ok')
    log(`   สมาชิก: ${members.length} คน`, 'ok')
    log(`   Transaction: ${txs.length} รายการ`, 'ok')
    log(`   Sync ต่อไป: 1 ชั่วโมง`, 'info')

  } catch (err) {
    log(`❌ ${err.message}`, 'error')
    saveLog('sync', 'error', 0, err.message)
  } finally {
    if (context) await context.close().catch(() => {})
    isRunning = false
  }
}

console.clear()
log('================================', 'info')
log('  WEED WALKER — Silompos Scraper v2', 'warn')
log('  sync ทุก 1 ชั่วโมง', 'warn')
log(`  ข้อมูลเก็บที่: ${DATA_DIR}`, 'info')
log('================================', 'info')

runSync()
cron.schedule('0 * * * *', () => { log('⏰ Cron — เริ่ม sync', 'info'); runSync() })
