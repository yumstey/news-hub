/**
 * Разделы карты сайта: так в Search Console и Яндекс Вебмастере видно,
 * какой раздел индексируется хуже, и ни один файл не упирается в лимит.
 */
export const SITEMAP_SECTIONS = ["pages", "skins", "cases", "updates", "esports"] as const

export type SitemapSection = (typeof SITEMAP_SECTIONS)[number]
