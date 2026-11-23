/**
 * start-all.ts — Полный цикл: запуск сайта + ночной авто-скрапинг.
 *
 * Запуск одной командой:
 *   npm run start:all
 *
 * Что делает:
 *   1. Запускает Next.js dev server (npm run dev)
 *   2. Запускает фоновый планировщик ночного скрапинга (nightly-sync.ts)
 *   3. При остановке (Ctrl+C) корректно завершает оба процесса
 *
 * Требования:
 *   - npm install выполнен в корне проекта
 *   - Playwright установлен в ww-scraper
 *   - DATABASE_URL настроен (опционально — без него импорт будет пропущен)
 */

import { spawn } from 'child_process'
import * as path from 'path'

const ROOT = path.resolve(__dirname, '..')

function log(msg: string) {
  const ts = new Date().toLocaleString('ru-RU', { timeZone: 'UTC' })
  console.log(`[${ts}] ${msg}`)
}

// ─── Запуск Next.js dev server ───

log('🚀 Запуск Next.js dev server...')
const devServer = spawn('npm', ['run', 'dev'], {
  cwd: ROOT,
  stdio: 'inherit',
})

devServer.on('error', (err: Error) => {
  log(`❌ Ошибка запуска dev server: ${err.message}`)
})

// ─── Запуск ночного планировщика ───

log('🌙 Запуск ночного планировщика скрапинга...')
const nightlySync = spawn('npx', ['ts-node', 'scripts/nightly-sync.ts'], {
  cwd: ROOT,
  stdio: 'inherit',
})

nightlySync.on('error', (err: Error) => {
  log(`❌ Ошибка запуска планировщика: ${err.message}`)
})

// ─── Обработка завершения ───

function shutdown() {
  log('🛑 Остановка...')
  devServer.kill('SIGTERM')
  nightlySync.kill('SIGTERM')
  setTimeout(() => process.exit(0), 2000)
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)

// Если один из процессов упал — завершаем всё
devServer.on('exit', (code: number | null) => {
  if (code !== null && code !== 0) {
    log(`❌ Dev server завершился с кодом ${code}`)
    shutdown()
  }
})

nightlySync.on('exit', (code: number | null) => {
  if (code !== null && code !== 0) {
    log(`⚠️  Планировщик завершился с кодом ${code} — dev server продолжает работу`)
  }
})

log('✅ Всё запущено. Нажмите Ctrl+C для остановки.')