/**
 * Приводит название карты к общему виду: источники пишут её по-разному —
 * «Dust II», «Dust2», «de_dust2».
 */
export function toMapSlug(name: string): string {
  const base = name
    .trim()
    .toLowerCase()
    .replace(/^de[_-]/, "")
    .replace(/[^a-z0-9]/g, "")

  if (base === "dustii" || base === "dust" || base === "dust2") return "dust2"
  if (base === "cobble") return "cobblestone"

  return base
}
