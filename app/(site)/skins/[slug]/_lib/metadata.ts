import { CATEGORY_LABEL, formatUsd, getSkinBySlug, RARITY_LABEL, skinHref } from "@/entities/skin"
import { slugSchema } from "@/shared/model"

import { buildMetadata, NOT_FOUND_METADATA } from "../../../_lib/metadata"

export async function generateMetadata(props: PageProps<"/skins/[slug]">) {
  const { slug } = await props.params
  const parsed = slugSchema.safeParse(slug)

  if (!parsed.success) return NOT_FOUND_METADATA

  const result = await getSkinBySlug(parsed.data)

  if (!result.ok) return NOT_FOUND_METADATA

  const { skin } = result.data
  const price = skin.fromPrice === null ? "" : ` от ${formatUsd(skin.fromPrice)}`
  const phase = skin.phase === null ? "" : ` ${skin.phase}`

  // Заголовок под запрос «<скин> цена»: название, цена, тип — самое кликабельное в выдаче.
  return buildMetadata(
    `${skin.name}${phase} — цена${price}, float и где купить`,
    `${skin.name}${phase}: цены по износу и StatTrak™${price}, диапазон float ${skin.minFloat ?? 0}–${skin.maxFloat ?? 1}, редкость «${RARITY_LABEL[skin.rarity]}», кейсы и коллекции. ${CATEGORY_LABEL[skin.category]} CS2.`,
    skinHref(skin.slug),
    {
      image: "file",
      keywords: [
        `${skin.name} цена`,
        `${skin.weapon} ${skin.pattern ?? ""} cs2`.trim(),
        `скины на ${skin.weapon}`,
        "скины cs2",
      ],
    },
  )
}
