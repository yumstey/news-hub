import type { ContentModule } from "@/shared/model"

export function articleTag(slug: string): string {
  return `article:${slug}`
}

export function articleModuleTag(module: ContentModule): string {
  return `article:module:${module}`
}

export function categoryTag(slug: string): string {
  return `category:${slug}`
}

export function feedTag(module: ContentModule): string {
  return `feed:${module}`
}

export const SITEMAP_TAG = "sitemap"

export function disciplineTag(slug: string): string {
  return `discipline:${slug}`
}

export function matchTag(id: string): string {
  return `match:${id}`
}

export function teamTag(slug: string): string {
  return `team:${slug}`
}

export function playerTag(slug: string): string {
  return `player:${slug}`
}

export function tournamentTag(slug: string): string {
  return `tournament:${slug}`
}

export function rankingTag(discipline: string): string {
  return `ranking:${discipline}`
}
