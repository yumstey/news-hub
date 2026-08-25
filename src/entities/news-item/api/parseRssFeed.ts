import { newsItemIdSchema } from "../model/newsItem"
import type { NewsItem, NewsSource } from "../model/newsItem"

const ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&apos;": "'",
  "&#39;": "'",
  "&nbsp;": " ",
  "&laquo;": "«",
  "&raquo;": "»",
  "&mdash;": "—",
  "&ndash;": "–",
}

function unescape(value: string): string {
  return value
    .replace(/&(?:amp|lt|gt|quot|apos|#39|nbsp|laquo|raquo|mdash|ndash);/g, (e) => ENTITIES[e] ?? e)
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
}

function decode(value: string): string {
  return unescape(
    value.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").replace(/<[^>]+>/g, " "),
  )
    .replace(/\s+/g, " ")
    .trim()
}

function rawTag(block: string, name: string): string | null {
  const match = new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, "i").exec(block)

  return match?.[1] ?? null
}

function tag(block: string, name: string): string | null {
  const raw = rawTag(block, name)

  return raw === null ? null : decode(raw)
}

function attribute(block: string, name: string, attr: string): string | null {
  const match = new RegExp(`<${name}[^>]*\\s${attr}="([^"]+)"`, "i").exec(block)

  return match?.[1] === undefined ? null : unescape(match[1]).trim()
}

function firstImageInHtml(block: string): string | null {
  const encoded = rawTag(block, "content:encoded") ?? rawTag(block, "description") ?? ""
  const match = /<img[^>]*\ssrc="([^"]+)"/i.exec(encoded.replace(/<!\[CDATA\[|\]\]>/g, ""))

  return match?.[1] === undefined ? null : unescape(match[1]).trim()
}

export function extractImage(block: string): string | null {
  const candidate =
    attribute(block, "media:content", "url") ??
    attribute(block, "media:thumbnail", "url") ??
    attribute(block, "enclosure", "url") ??
    firstImageInHtml(block)

  if (candidate === null) return null

  return /^https:\/\//.test(candidate) ? candidate : null
}

export type ParseOptions = {
  source: NewsSource
  allowImages: boolean
}

export function parseRssFeed(xml: string, options: ParseOptions): NewsItem[] {
  const blocks = xml.split(/<item(?=[\s>])/i).slice(1)
  const items: NewsItem[] = []

  for (const raw of blocks) {
    const closing = raw.search(/<\/item>/i)
    const block = closing < 0 ? raw : raw.slice(0, closing)
    const title = tag(block, "title")
    const url = tag(block, "link")
    const published = tag(block, "pubDate") ?? tag(block, "dc:date")

    if (title === null || url === null || published === null) continue
    if (!/^https?:\/\//.test(url)) continue

    const timestamp = Date.parse(published)

    if (!Number.isFinite(timestamp)) continue

    const image = options.allowImages ? extractImage(block) : null
    const excerpt = tag(block, "description") ?? ""

    items.push({
      id: newsItemIdSchema.parse(tag(block, "guid") ?? url),
      title,
      excerpt: excerpt.length > 280 ? `${excerpt.slice(0, 277)}…` : excerpt,
      url,
      source: options.source,
      image:
        image === null ? null : { url: image, width: 800, height: 450, alt: title },
      publishedAt: new Date(timestamp),
    })
  }

  return items
}
