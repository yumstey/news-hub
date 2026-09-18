import { SITE_URL } from "@/shared/config"
import type { JsonLdNode } from "@/shared/lib/seo"

import { CATEGORY_LABEL, RARITY_LABEL } from "../model/skin"
import type { Skin } from "../model/skin"
import { skinHref } from "./skinHref"

/**
 * Product + AggregateOffer: даёт шанс на расширенный сниппет с ценой
 * «от $X до $Y» прямо в выдаче Google и Яндекса.
 */
export function buildSkinJsonLd(skin: Skin): JsonLdNode {
  const url = new URL(skinHref(skin.slug), SITE_URL).toString()
  const listed = skin.prices.filter((price) => price.min !== null)
  const low = listed.length === 0 ? null : Math.min(...listed.map((price) => price.min ?? 0))
  const high = listed.length === 0 ? null : Math.max(...listed.map((price) => price.min ?? 0))
  const offers = listed.reduce((sum, price) => sum + price.quantity, 0)

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: skin.name,
    url,
    ...(skin.image === null ? {} : { image: skin.image }),
    description:
      skin.description ??
      `${skin.name} — скин CS2 категории «${RARITY_LABEL[skin.rarity]}».`,
    brand: { "@type": "Brand", name: "Counter-Strike 2" },
    category: `Скины CS2 / ${CATEGORY_LABEL[skin.category]} / ${skin.weapon}`,
    additionalProperty: [
      { "@type": "PropertyValue", name: "Редкость", value: RARITY_LABEL[skin.rarity] },
      ...(skin.minFloat === null || skin.maxFloat === null
        ? []
        : [
            {
              "@type": "PropertyValue",
              name: "Диапазон float",
              value: `${skin.minFloat}–${skin.maxFloat}`,
            },
          ]),
    ],
    ...(low === null || high === null
      ? {}
      : {
          offers: {
            "@type": "AggregateOffer",
            priceCurrency: "USD",
            lowPrice: low.toFixed(2),
            highPrice: high.toFixed(2),
            offerCount: offers,
            availability: "https://schema.org/InStock",
            url,
          },
        }),
  }
}
