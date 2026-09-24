"use client"

import { useSyncExternalStore } from "react"

import { formatDayLabel, formatDayMonth, formatTime, SITE_TIME_ZONE_LABEL } from "@/shared/lib/date"

// Время не «подписывается» на изменения: снимок берётся один раз при гидратации.
const subscribe = () => () => {}

const TIME = new Intl.DateTimeFormat("ru-RU", { hour: "2-digit", minute: "2-digit", hourCycle: "h23" })
const DAY_MONTH = new Intl.DateTimeFormat("ru-RU", { day: "2-digit", month: "2-digit" })
const DAY_LABEL = new Intl.DateTimeFormat("ru-RU", { weekday: "long", day: "numeric", month: "long" })

export type LocalTimeFormat = "time" | "day-month" | "time-day"

function inBrowser(date: Date, format: LocalTimeFormat): string {
  if (format === "time") return TIME.format(date)
  if (format === "day-month") return DAY_MONTH.format(date)

  return `${TIME.format(date)} · ${DAY_MONTH.format(date)}`
}

function onServer(date: Date, format: LocalTimeFormat): string {
  if (format === "time") return formatTime(date)
  if (format === "day-month") return formatDayMonth(date)

  return `${formatTime(date)} · ${formatDayMonth(date)}`
}

export type LocalTimeProps = {
  /** Момент в ISO 8601. */
  value: string
  format?: LocalTimeFormat
  className?: string
}

/**
 * Время матча в часовом поясе зрителя. Сервер отдаёт московское время, браузер
 * при гидратации подменяет его на местное — без рассинхрона разметки.
 */
export function LocalTime({ value, format = "time", className }: LocalTimeProps) {
  const text = useSyncExternalStore(
    subscribe,
    () => inBrowser(new Date(value), format),
    () => onServer(new Date(value), format),
  )

  return (
    <time dateTime={value} className={className}>
      {text}
    </time>
  )
}

function startOfDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
}

const DAY_MS = 24 * 60 * 60 * 1000

function relativeDay(date: Date): string | null {
  const diff = Math.round((startOfDay(date) - startOfDay(new Date())) / DAY_MS)

  if (diff === 0) return "Сегодня"
  if (diff === 1) return "Завтра"
  if (diff === -1) return "Вчера"

  return null
}

function capitalise(value: string): string {
  return value.slice(0, 1).toUpperCase() + value.slice(1)
}

function dayInBrowser(value: string): string {
  const date = new Date(value)
  const label = DAY_LABEL.format(date)
  const relative = relativeDay(date)

  return relative === null ? capitalise(label) : `${relative} · ${label}`
}

const DAY_SHORT = new Intl.DateTimeFormat("ru-RU", { weekday: "short", day: "2-digit", month: "2-digit" })

function shortDayInBrowser(value: string): string {
  const date = new Date(value)

  return relativeDay(date) ?? capitalise(DAY_SHORT.format(date))
}

export type LocalDayLabelProps = {
  value: string
  /** Короткая подпись для переключателя дней: «Сегодня», «пт, 26.09». */
  short?: boolean
  className?: string
}

/** «Сегодня · пятница, 18 сентября» — относительно дня зрителя. */
export function LocalDayLabel({ value, short = false, className }: LocalDayLabelProps) {
  const text = useSyncExternalStore(
    subscribe,
    () => (short ? shortDayInBrowser(value) : dayInBrowser(value)),
    () => (short ? formatDayMonth(new Date(value)) : capitalise(formatDayLabel(new Date(value)))),
  )

  return (
    <time dateTime={value.slice(0, 10)} className={className}>
      {text}
    </time>
  )
}

function zoneInBrowser(): string {
  const offset = -new Date().getTimezoneOffset()

  if (offset === 180) return SITE_TIME_ZONE_LABEL

  const sign = offset >= 0 ? "+" : "−"
  const hours = Math.floor(Math.abs(offset) / 60)
  const minutes = Math.abs(offset) % 60

  return `UTC${sign}${hours}${minutes === 0 ? "" : `:${String(minutes).padStart(2, "0")}`}`
}

/** Подпись часового пояса, в котором показано время на странице. */
export function TimeZoneLabel({ className }: { className?: string }) {
  const text = useSyncExternalStore(subscribe, zoneInBrowser, () => SITE_TIME_ZONE_LABEL)

  return <span className={className}>{text}</span>
}
