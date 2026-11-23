/**
 * nightly-sync.ts — Фоновый процесс для ежедневного авто-скрапинга.
 *
 * Запускает npm run sync:all каждый день в заданное время (по умолчанию 3:00 AM).
 * Не требует внешних зависимостей — использует простой таймер.
 *
 * Используется из scripts/start-all.ts или напрямую:
 *   npx ts-node scripts/nightly-sync.ts
 */

import { execSync } from 'child_process'
import * as path from 'path'

const ROOT = path.resolve(__dirname, '..')

// Время запуска: часы и минуты (24h формат)
const SCHEDULE_HOUR = 3   // 3:00 AM
const SCHEDULE_MIN = 0

function log(msg: string) {
  const ts = new Date().toLocaleString('ru-RU', { timeZone: 'UTC' })
  console.log(`[${ts}] [nightly-sync] ${msg}`)
}

/**
 * Возвращает количество миллисекунд до следующего запланированного запуска.
 */
function msUntilNext(): number {
  const now = new Date()
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate(), SCHEDULE_HOUR, SCHEDULE_MIN, 0, 0)

  if (next <= now) {
    // Сегодняшний запуск уже прошёл — планируем на завтра
    next.setDate(next.getDate() + 1)
  }

  return next.getTime() - now.getTime()
}

async function runSync() {
  log(`🌙 Запуск ночного скрапинга (${SCHEDULE_HOUR}:${String(SCHEDULE_MIN).padStart(2, '0')})...`)
  try {
    execSync('npm run sync:all', {
      cwd: ROOT,
      stdio: 'inherit',
      timeout: 600_000, // 10 минут макс
    })
    log('✅ Ночной скрапинг завершён')
  } catch (e: any) {
    log(`❌ Ошибка ночного скрапинга: ${e.message}`)
  }
}

function scheduleNext() {
  const delay = msUntilNext()
  const nextDate = new Date(Date.now() + delay)
  log(`⏰ Следующий запуск: ${nextDate.toLocaleString('ru-RU')} (через ${Math.round(delay / 1000 / 60)} мин)`)

  setTimeout(async () => {
    await runSync()
    scheduleNext() // планируем следующий запуск
  }, delay)
}

// ─── Точка входа ───

const now = new Date()
log(`🕐 Запущен ночной планировщик`)
log(`   Расписание: ежедневно в ${SCHEDULE_HOUR}:${String(SCHEDULE_MIN).padStart(2, '0')}`)
log(`   Текущее время: ${now.toLocaleString('ru-RU')}`)
log(`   Для остановки: Ctrl+C`)

scheduleNext()

// Держим процесс активным
process.stdin.resume()
process.on('SIGINT', () => {
  log('👋 Планировщик остановлен')
  process.exit(0)
})