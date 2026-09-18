import { CATEGORY_ORDER, RARITY_ORDER, SORT_LABEL } from "../model/skin"
import type { SkinCategory, SkinRarity, SkinSort, SkinSummary } from "../model/skin"

type RawParams = Record<string, string | string[] | undefined>

function first(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? ""
}

function oneOf<T extends string>(value: string, allowed: readonly T[]): T | null {
  return (allowed as readonly string[]).includes(value) ? (value as T) : null
}

/** Разбирает адресную строку каталога; мусорные значения просто игнорируются. */
export function parseSkinQuery(params: RawParams): SkinQuery {
  return {
    category: oneOf(first(params.category), CATEGORY_ORDER),
    rarity: oneOf(first(params.rarity), RARITY_ORDER),
    weaponSlug: null,
    search: first(params.q).slice(0, 60),
    sort: oneOf(first(params.sort), Object.keys(SORT_LABEL) as SkinSort[]) ?? "popular",
  }
}

/** Обратное преобразование: только отличные от умолчания значения, чтобы адреса были короткими. */
export function skinQueryParams(query: SkinQuery): Record<string, string> {
  const params: Record<string, string> = {}

  if (query.category !== null) params.category = query.category
  if (query.rarity !== null) params.rarity = query.rarity
  if (query.search.length > 0) params.q = query.search
  if (query.sort !== "popular") params.sort = query.sort

  return params
}

export function isFiltered(query: SkinQuery): boolean {
  return Object.keys(skinQueryParams(query)).length > 0
}

export type SkinQuery = {
  category: SkinCategory | null
  rarity: SkinRarity | null
  weaponSlug: string | null
  search: string
  sort: SkinSort
}

export const DEFAULT_SKIN_QUERY: SkinQuery = {
  category: null,
  rarity: null,
  weaponSlug: null,
  search: "",
  sort: "popular",
}

function byPrice(direction: 1 | -1) {
  return (left: SkinSummary, right: SkinSummary): number => {
    // Предметы без цены всегда в конце, в какую сторону ни сортируй.
    if (left.fromPrice === null && right.fromPrice === null) return 0
    if (left.fromPrice === null) return 1
    if (right.fromPrice === null) return -1

    return (left.fromPrice - right.fromPrice) * direction
  }
}

export function querySkins(skins: readonly SkinSummary[], query: SkinQuery): SkinSummary[] {
  const needle = query.search.trim().toLowerCase()

  const matched = skins.filter(
    (skin) =>
      (query.category === null || skin.category === query.category) &&
      (query.rarity === null || skin.rarity === query.rarity) &&
      (query.weaponSlug === null || skin.weaponSlug === query.weaponSlug) &&
      (needle.length === 0 || skin.name.toLowerCase().includes(needle)),
  )

  switch (query.sort) {
    case "price-desc":
      return matched.sort(byPrice(-1))
    case "price-asc":
      return matched.sort(byPrice(1))
    case "rarity":
      return matched.sort(
        (left, right) =>
          RARITY_ORDER.indexOf(right.rarity) - RARITY_ORDER.indexOf(left.rarity) ||
          byPrice(-1)(left, right),
      )
    case "name":
      return matched.sort((left, right) => left.name.localeCompare(right.name))
    case "popular":
      return matched.sort((left, right) => right.listings - left.listings)
  }
}
