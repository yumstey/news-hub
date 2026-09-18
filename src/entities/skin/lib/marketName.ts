import { WEAR_MARKET_NAME } from "../model/skin"
import type { SkinVariant, SkinWear } from "../model/skin"

const STAR = "★ "

/**
 * Собирает market_hash_name так, как его пишут Steam и маркетплейсы:
 * «StatTrak™ AK-47 | Redline (Field-Tested)», но «★ StatTrak™ Karambit | Doppler (Factory New)».
 */
export function marketHashName(name: string, variant: SkinVariant, wear: SkinWear | null): string {
  const suffix = wear === null ? "" : ` (${WEAR_MARKET_NAME[wear]})`

  if (variant === "normal") return `${name}${suffix}`

  const prefix = variant === "stattrak" ? "StatTrak™ " : "Souvenir "

  if (name.startsWith(STAR)) return `${STAR}${prefix}${name.slice(STAR.length)}${suffix}`

  return `${prefix}${name}${suffix}`
}

/** Название без звезды ножей и перчаток — для заголовков и адресов. */
export function displayName(name: string): string {
  return name.startsWith(STAR) ? name.slice(STAR.length) : name
}
