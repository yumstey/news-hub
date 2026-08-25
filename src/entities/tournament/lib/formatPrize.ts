export function formatPrize(
  amount: number | null,
  currency: string,
  locale: string,
): string {
  if (amount === null) return "—"

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}
