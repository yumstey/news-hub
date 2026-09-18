import { CATEGORY_LABEL, formatUsd, getSkinBySlug, RARITY_LABEL } from "@/entities/skin"
import { OG_CONTENT_TYPE, OG_SIZE, ogImageResponse } from "@/shared/lib/og"

export const alt = "Скин CS2: цена и характеристики"
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

const GOLD = "#e4ae39"

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const result = await getSkinBySlug(slug)

  if (!result.ok) {
    return ogImageResponse({ eyebrow: "Скины", title: "Скины CS2 и цены" })
  }

  const { skin } = result.data
  const gold = skin.category === "knives" || skin.category === "gloves"

  return ogImageResponse({
    eyebrow: `Скины · ${CATEGORY_LABEL[skin.category]}`,
    title: `${skin.name}${skin.phase === null ? "" : ` ${skin.phase}`}`,
    subtitle: `${RARITY_LABEL[skin.rarity]} · float ${skin.minFloat ?? 0}–${skin.maxFloat ?? 1}`,
    image: skin.image,
    accent: gold ? GOLD : skin.rarityColor,
    badge: skin.fromPrice === null ? "Нет в продаже" : `от ${formatUsd(skin.fromPrice)}`,
  })
}
