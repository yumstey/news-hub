import { getCrateBySlug } from "@/entities/crate"
import { formatUsd } from "@/entities/skin"
import { OG_CONTENT_TYPE, OG_SIZE, ogImageResponse } from "@/shared/lib/og"

export const alt = "Кейс CS2: что выпадает и шансы"
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const result = await getCrateBySlug(slug)

  if (!result.ok) {
    return ogImageResponse({ eyebrow: "Кейсы", title: "Кейсы CS2: шансы и цены" })
  }

  const crate = result.data

  return ogImageResponse({
    eyebrow: "Кейсы",
    title: crate.name,
    subtitle: `${crate.itemCount} скинов + ${crate.rareLabel ?? "нож"} · шанс ножа 0,26%`,
    image: crate.image,
    accent: "#e4ae39",
    badge: crate.price === null ? "Что выпадает" : `Кейс ${formatUsd(crate.price)}`,
  })
}
