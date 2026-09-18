const usd = new Intl.NumberFormat("ru-RU", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
})

const usdRound = new Intl.NumberFormat("ru-RU", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
})

/** Цена в долларах: копейки прячем у дорогих предметов, чтобы не шуметь. */
export function formatUsd(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return "—"

  return value >= 1000 ? usdRound.format(value) : usd.format(value)
}
