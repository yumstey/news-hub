import { serializeJsonLd } from "@/shared/lib/seo"
import type { JsonLdNode } from "@/shared/lib/seo"

export type JsonLdProps = {
  data: JsonLdNode | JsonLdNode[]
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  )
}
