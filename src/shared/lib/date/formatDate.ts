/**
 * Сайт русскоязычный, поэтому на сервере время показываем по Москве, а браузер
 * затем подставляет местное время зрителя (см. shared/ui/local-time).
 * В Москве с 2014 года круглый год UTC+3 без перехода на летнее время —
 * сдвиг на постоянный offset точен и не требует базы часовых поясов.
 */
export const SITE_TIME_ZONE = "Europe/Moscow"
export const SITE_TIME_ZONE_LABEL = "МСК"
const SITE_OFFSET_MS = 3 * 60 * 60 * 1000

const MONTHS_GENITIVE = [
  "января",
  "февраля",
  "марта",
  "апреля",
  "мая",
  "июня",
  "июля",
  "августа",
  "сентября",
  "октября",
  "ноября",
  "декабря",
] as const

const WEEKDAYS = [
  "воскресенье",
  "понедельник",
  "вторник",
  "среда",
  "четверг",
  "пятница",
  "суббота",
] as const

function pad(value: number): string {
  return String(value).padStart(2, "0")
}

/** Дата, у которой UTC-поля равны московскому времени исходного момента. */
function inSiteZone(value: Date): Date {
  return new Date(value.getTime() + SITE_OFFSET_MS)
}

export function formatDate(value: Date): string {
  const local = inSiteZone(value)

  return `${pad(local.getUTCDate())}.${pad(local.getUTCMonth() + 1)}.${local.getUTCFullYear()}`
}

export function formatTime(value: Date): string {
  const local = inSiteZone(value)

  return `${pad(local.getUTCHours())}:${pad(local.getUTCMinutes())}`
}

export function formatDateTime(value: Date): string {
  return `${formatDate(value)}, ${formatTime(value)} ${SITE_TIME_ZONE_LABEL}`
}

/** «18.09» — компактная дата без года для строк расписания. */
export function formatDayMonth(value: Date): string {
  const local = inSiteZone(value)

  return `${pad(local.getUTCDate())}.${pad(local.getUTCMonth() + 1)}`
}

/** «пятница, 18 сентября». */
export function formatDayLabel(value: Date): string {
  const local = inSiteZone(value)

  return `${WEEKDAYS[local.getUTCDay()]}, ${local.getUTCDate()} ${MONTHS_GENITIVE[local.getUTCMonth()]}`
}

export function toIsoDate(value: Date): string {
  return value.toISOString()
}

/** Ключ календарного дня по Москве — для группировки расписания. */
export function dayKey(value: Date): string {
  return inSiteZone(value).toISOString().slice(0, 10)
}
