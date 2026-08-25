function pad(value: number): string {
  return String(value).padStart(2, "0")
}

export function formatDate(value: Date): string {
  return `${pad(value.getUTCDate())}.${pad(value.getUTCMonth() + 1)}.${value.getUTCFullYear()}`
}

export function formatTime(value: Date): string {
  return `${pad(value.getUTCHours())}:${pad(value.getUTCMinutes())}`
}

export function formatDateTime(value: Date): string {
  return `${formatDate(value)}, ${formatTime(value)}`
}

export function formatDayMonth(value: Date): string {
  return `${pad(value.getUTCDate())}.${pad(value.getUTCMonth() + 1)}.${value.getUTCFullYear()}`
}

export function formatDayLabel(value: Date): string {
  return formatDate(value)
}

export function toIsoDate(value: Date): string {
  return value.toISOString()
}

export function dayKey(value: Date): string {
  return value.toISOString().slice(0, 10)
}
