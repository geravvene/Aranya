/**
 * sync-all.ts — Полный цикл: скрапинг Silompos → импорт в PostgreSQL.
 *
 * Запуск одной командой:
 *   npx ts-node scripts/sync-all.ts
 *
 * Что делает:
 *   1. Запускает ww-scraper/scraper.js --once (один проход, без cron)
 *   2. После завершения скрапинга импортирует JSON → PostgreSQL
 *
 * Требования:
 *   - Установлен DATABASE_URL в .env или окружении
 *   - Выполнен prisma generate
 *   - В ww-scraper: npm install, npx playwright install chromium
 */

import { execSync, spawn } from 'child_process'
import * as path from 'path'
import * as fs from 'fs'

const ROOT = path.resolve(__dirname, '..')
const SCRAPER_DIR = path.join(ROOT, 'ww-scraper')
const SCRAPER_SCRIPT = path.join(SCRAPER_DIR, 'scraper.js')

function log(msg: string) {
  const ts = new Date().toLocaleString('ru-RU', { timeZone: 'UTC' })
  console.log(`[${ts}] ${msg}`)
}

function checkPrerequisites(): string[] {
  const warnings: string[] = []

  // Проверка node
  try {
    execSync('node --version', { stdio: 'ignore' })
  } catch {
    warnings.push('Node.js не найден. Установите Node.js LTS: https://nodejs.org')
  }

  // Проверка scraper.js
  if (!fs.existsSync(SCRAPER_SCRIPT)) {
    warnings.push(`Файл скрапера не найден: ${SCRAPER_SCRIPT}`)
  }

  // Проверка DATABASE_URL
  if (!process.env.DATABASE_URL) {
    warnings.push('DATABASE_URL не задан. Импорт в PostgreSQL будет пропущен.')
  }

  // Проверка зависимостей ww-scraper
  const scraperPkg = path.join(SCRAPER_DIR, 'package.json')
  if (fs.existsSync(scraperPkg)) {
    const pkg = JSON.parse(fs.readFileSync(scraperPkg, 'utf8'))
    if (pkg.dependencies?.playwright) {
      const playwrightDir = path.join(SCRAPER_DIR, 'node_modules', 'playwright')
      if (!fs.existsSync(playwrightDir)) {
        warnings.push('Playwright не установлен в ww-scraper. Выполните: cd ww-scraper && npm install && npx playwright install chromium')
      }
    }
  }

  return warnings
}

async function runScraper(): Promise<boolean> {
  log('🌐 Запуск скрапера Silompos...')
  log('   Будет открыт браузер — выполните вход через Google аккаунт weedwalker.th@gmail.com')
  log('   После входа скрапер соберёт данные автоматически.')
  log('')

  return new Promise((resolve) => {
    const child = spawn('node', [SCRAPER_SCRIPT, '--once'], {
      cwd: SCRAPER_DIR,
      stdio: 'inherit',
    })

    child.on('exit', (code: number | null) => {
      if (code === 0) {
        log('✅ Скрапинг завершён успешно')
        resolve(true)
      } else {
        log(`❌ Скрапинг завершился с кодом ${code ?? -1}`)
        resolve(false)
      }
    })

    child.on('error', (err: Error) => {
      log(`❌ Ошибка запуска скрапера: ${err.message}`)
      resolve(false)
    })
  })
}

async function runImport(): Promise<boolean> {
  if (!process.env.DATABASE_URL) {
    log('⚠️  DATABASE_URL не задан — импорт пропущен')
    return false
  }

  log('📦 Импорт данных в PostgreSQL...')
  try {
    execSync(
      'npx ts-node --compiler-options \'{"module":"commonjs"}\' scripts/import-ww-scraper.ts',
      {
        cwd: ROOT,
        stdio: 'inherit',
      },
    )
    log('✅ Импорт в PostgreSQL завершён')
    return true
  } catch (e: any) {
    log(`❌ Ошибка импорта: ${e.message}`)
    return false
  }
}

async function main() {
  log('═══════════════════════════════════════════')
  log('  Weed Walker — полный цикл sync + import')
  log('═══════════════════════════════════════════')
  log('')

  // Проверка предусловий
  const warnings = checkPrerequisites()
  for (const w of warnings) {
    log(`⚠️  ${w}`)
  }
  if (warnings.some(w => w.startsWith('Node.js'))) {
    log('❌ Критическая ошибка — прерывание')
    process.exit(1)
  }

  log('')

  // Шаг 1: скрапинг
  const scraperOk = await runScraper()
  if (!scraperOk) {
    log('⚠️  Скрапинг не дал данных или был прерван')
  }

  log('')

  // Шаг 2: импорт
  await runImport()

  log('')
  log('═══════════════════════════════════════════')
  log('  Готово! Данные синхронизированы.')
  log('  Запустите npm run dev для просмотра.')
  log('═══════════════════════════════════════════')
}

main().catch((e) => {
  console.error('Fatal error:', e)
  process.exit(1)
})