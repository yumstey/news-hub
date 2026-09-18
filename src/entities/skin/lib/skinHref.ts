import type { SkinPath, WeaponPath } from "@/shared/config"

export function skinHref(slug: string): SkinPath {
  return `/skins/${slug}`
}

export function weaponHref(slug: string): WeaponPath {
  return `/skins/weapons/${slug}`
}
