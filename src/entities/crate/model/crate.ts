import type { Slug } from "@/shared/model"

import type { SkinRarity } from "@/entities/skin/@x/crate"

/** Предмет внутри кейса с ценой из каталога скинов. */
export type CrateItem = {
  id: string
  slug: Slug | null
  name: string
  image: string | null
  rarity: SkinRarity
  /** Медианная цена в самом ходовом износе, USD. */
  price: number | null
}

export type CrateRarityGroup = {
  rarity: SkinRarity | "rare"
  /** Шанс выпадения группы, 0..1. */
  chance: number
  items: CrateItem[]
  /** Средняя цена предмета группы — вклад в ожидаемую стоимость. */
  averagePrice: number | null
}

export type CrateSummary = {
  id: string
  slug: Slug
  name: string
  image: string | null
  releasedAt: Date | null
  price: number | null
  itemCount: number
  rareLabel: string | null
  listings: number
}

export type Crate = CrateSummary & {
  groups: CrateRarityGroup[]
  /** Оценка средней стоимости выпавшего предмета, USD. */
  expectedValue: number | null
  /** Кейс + ключ: сколько стоит одно открытие. */
  openCost: number | null
  itemPage: string | null
}

/**
 * Шансы, раскрытые Valve: армейское 79,92%, запрещённое 15,98%,
 * засекреченное 3,2%, тайное 0,64%, редкий особый предмет 0,26%.
 */
export const CRATE_ODDS: Record<"milspec" | "restricted" | "classified" | "covert" | "rare", number> = {
  milspec: 0.7992,
  restricted: 0.1598,
  classified: 0.032,
  covert: 0.0064,
  rare: 0.0026,
}

/** Цена ключа в Steam, USD. */
export const KEY_PRICE = 2.49

export const RARE_LABEL = "Редкий особый предмет"
