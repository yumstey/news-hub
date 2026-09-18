import { SITE_URL } from "@/shared/config"
import type { JsonLdNode } from "@/shared/lib/seo"

import type { Crate } from "../model/crate"
import { crateHref } from "./crateHref"

export function buildCrateJsonLd(crate: Crate): JsonLdNode {
  const url = new URL(crateHref(crate.slug), SITE_URL).toString()

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: crate.name,
    url,
    ...(crate.image === null ? {} : { image: crate.image }),
    description: `${crate.name}: ${crate.itemCount} скинов, шансы выпадения и цена кейса CS2.`,
    brand: { "@type": "Brand", name: "Counter-Strike 2" },
    category: "Кейсы CS2",
    ...(crate.price === null
      ? {}
      : {
          offers: {
            "@type": "AggregateOffer",
            priceCurrency: "USD",
            lowPrice: crate.price.toFixed(2),
            offerCount: crate.listings,
            availability: "https://schema.org/InStock",
            url,
          },
        }),
  }
}
