export type JsonLdNode = Record<string, unknown>

export function serializeJsonLd(node: JsonLdNode | JsonLdNode[]): string {
  return JSON.stringify(node).replace(/</g, "\u003c")
}

export type BreadcrumbEntry = {
  name: string
  url: string
}

export function buildBreadcrumbJsonLd(entries: readonly BreadcrumbEntry[]): JsonLdNode {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: entries.map((entry, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: entry.name,
      item: entry.url,
    })),
  }
}

export type ItemListEntry = {
  name: string
  url: string
}

export function buildItemListJsonLd(entries: readonly ItemListEntry[]): JsonLdNode {
  return {
    "@type": "ItemList",
    numberOfItems: entries.length,
    itemListElement: entries.map((entry, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: entry.name,
      url: entry.url,
    })),
  }
}

export type CollectionPageInput = {
  name: string
  description: string
  url: string
  items: readonly ItemListEntry[]
}

export function buildCollectionPageJsonLd(input: CollectionPageInput): JsonLdNode {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: input.name,
    description: input.description,
    url: input.url,
    mainEntity: buildItemListJsonLd(input.items),
  }
}
