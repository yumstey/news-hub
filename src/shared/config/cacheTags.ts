export const CS2_MODULE = "cs2"

export function articleTag(slug: string): string {
  return `article:${slug}`
}

export function articleModuleTag(module: string): string {
  return `article:module:${module}`
}

export function feedTag(module: string): string {
  return `feed:${module}`
}

export const SITEMAP_TAG = "sitemap"

export function matchTag(id: string): string {
  return `match:${id}`
}

export function scheduleTag(scope: string): string {
  return `schedule:${scope}`
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

export function rankingTag(scope: string): string {
  return `ranking:${scope}`
}
