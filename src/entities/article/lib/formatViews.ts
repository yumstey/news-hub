export function formatViews(views: number, locale: string): string {
  if (views < 1000) return new Intl.NumberFormat(locale).format(views)

  return new Intl.NumberFormat(locale, {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(views)
}
