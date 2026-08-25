import type { NewsSource } from "../model/newsItem"

export type FeedDefinition = {
  source: NewsSource
  url: string
  allowImages: boolean
  cs2Only: boolean
}

export const CS2_KEYWORDS = [
  "counter-strike",
  "counter strike",
  "cs2",
  "cs:go",
  "csgo",
  "valve",
  "hltv",
  "esl pro league",
  "blast premier",
  "iem ",
  "major",
]

export const FEEDS: readonly FeedDefinition[] = [
  {
    source: { name: "HLTV", url: "https://www.hltv.org" },
    url: "https://www.hltv.org/rss/news",
    allowImages: false,
    cs2Only: true,
  },
  {
    source: { name: "PCGamesN", url: "https://www.pcgamesn.com" },
    url: "https://www.pcgamesn.com/counter-strike-2/feed",
    allowImages: true,
    cs2Only: true,
  },
  {
    source: { name: "Dexerto", url: "https://www.dexerto.com" },
    url: "https://www.dexerto.com/feed/",
    allowImages: true,
    cs2Only: false,
  },
]

export function isCs2Related(title: string, excerpt: string): boolean {
  const haystack = `${title} ${excerpt}`.toLowerCase()

  return CS2_KEYWORDS.some((keyword) => haystack.includes(keyword))
}
