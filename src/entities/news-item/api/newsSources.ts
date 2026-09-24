import type { NewsLanguage, NewsSource } from "../model/newsItem"

/**
 * Как показывать картинки ленты: "optimized" — через оптимизатор Next,
 * "direct" — браузер берёт их с CDN источника (сервер туда не пускают),
 * "none" — картинок в ленте нет, карточка получит кадр из игры.
 */
export type FeedImages = "optimized" | "direct" | "none"

/**
 * Какие материалы ленты относятся к CS2: вся лента, отбор по ключевым словам
 * или по разделу сайта в ссылке (у Cybersport.ru это /tags/cs2/).
 */
export type FeedScope = "all" | "keywords" | { linkIncludes: string }

export type FeedDefinition = {
  source: NewsSource
  url: string
  images: FeedImages
  language: NewsLanguage
  scope: FeedScope
}

export const CS2_KEYWORDS = [
  "counter-strike",
  "counter strike",
  "cs2",
  "cs:go",
  "csgo",
  "hltv",
  "esl pro league",
  "blast premier",
  "blast open",
  "iem ",
  "starladder",
  "cs major",
]

export const FEEDS: readonly FeedDefinition[] = [
  {
    source: { name: "Cybersport.ru", url: "https://www.cybersport.ru/tags/cs2" },
    url: "https://www.cybersport.ru/rss/materials",
    images: "optimized",
    language: "ru",
    scope: { linkIncludes: "/tags/cs2/" },
  },
  {
    source: { name: "Dust2.us", url: "https://www.dust2.us" },
    url: "https://www.dust2.us/rss",
    images: "none",
    language: "en",
    scope: "all",
  },
  {
    source: { name: "PCGamesN", url: "https://www.pcgamesn.com" },
    url: "https://www.pcgamesn.com/counter-strike-2/feed",
    images: "optimized",
    language: "en",
    scope: "all",
  },
  {
    source: { name: "Dexerto", url: "https://www.dexerto.com" },
    url: "https://www.dexerto.com/feed/",
    images: "optimized",
    language: "en",
    scope: "keywords",
  },
  {
    source: { name: "esports.gg", url: "https://esports.gg" },
    url: "https://esports.gg/feed/",
    images: "optimized",
    language: "en",
    scope: "keywords",
  },
]

export function isCs2Related(title: string, excerpt: string): boolean {
  const haystack = `${title} ${excerpt}`.toLowerCase()

  return CS2_KEYWORDS.some((keyword) => haystack.includes(keyword))
}
