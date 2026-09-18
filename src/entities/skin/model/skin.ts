import type { Slug } from "@/shared/model"

export type SkinRarity =
  | "consumer"
  | "industrial"
  | "milspec"
  | "restricted"
  | "classified"
  | "covert"
  | "extraordinary"
  | "contraband"

/** Официальные русские названия редкостей из клиента CS2. */
export const RARITY_LABEL: Record<SkinRarity, string> = {
  consumer: "Ширпотреб",
  industrial: "Промышленное качество",
  milspec: "Армейское качество",
  restricted: "Запрещённое",
  classified: "Засекреченное",
  covert: "Тайное",
  extraordinary: "Экстраординарное",
  contraband: "Контрабанда",
}

/** От самого частого к самому редкому — для сортировки и фильтров. */
export const RARITY_ORDER: readonly SkinRarity[] = [
  "consumer",
  "industrial",
  "milspec",
  "restricted",
  "classified",
  "covert",
  "extraordinary",
  "contraband",
]

export type SkinCategory =
  | "rifles"
  | "pistols"
  | "smgs"
  | "heavy"
  | "knives"
  | "gloves"
  | "equipment"

export const CATEGORY_LABEL: Record<SkinCategory, string> = {
  rifles: "Винтовки",
  pistols: "Пистолеты",
  smgs: "Пистолеты-пулемёты",
  heavy: "Тяжёлое оружие",
  knives: "Ножи",
  gloves: "Перчатки",
  equipment: "Снаряжение",
}

export const CATEGORY_ORDER: readonly SkinCategory[] = [
  "knives",
  "gloves",
  "rifles",
  "pistols",
  "smgs",
  "heavy",
  "equipment",
]

export type SkinWear = "fn" | "mw" | "ft" | "ww" | "bs"

export const WEAR_ORDER: readonly SkinWear[] = ["fn", "mw", "ft", "ww", "bs"]

export const WEAR_LABEL: Record<SkinWear, string> = {
  fn: "Прямо с завода",
  mw: "Немного поношенное",
  ft: "После полевых испытаний",
  ww: "Поношенное",
  bs: "Закалённое в боях",
}

export const WEAR_SHORT: Record<SkinWear, string> = {
  fn: "FN",
  mw: "MW",
  ft: "FT",
  ww: "WW",
  bs: "BS",
}

/** Английское название износа — часть market_hash_name. */
export const WEAR_MARKET_NAME: Record<SkinWear, string> = {
  fn: "Factory New",
  mw: "Minimal Wear",
  ft: "Field-Tested",
  ww: "Well-Worn",
  bs: "Battle-Scarred",
}

export const WEAR_FLOAT: Record<SkinWear, readonly [number, number]> = {
  fn: [0, 0.07],
  mw: [0.07, 0.15],
  ft: [0.15, 0.38],
  ww: [0.38, 0.45],
  bs: [0.45, 1],
}

export type SkinVariant = "normal" | "stattrak" | "souvenir"

export const VARIANT_LABEL: Record<SkinVariant, string> = {
  normal: "Обычный",
  stattrak: "StatTrak™",
  souvenir: "Сувенирный",
}

export type SkinRef = {
  id: string
  slug: Slug
  name: string
  image: string | null
}

/** Цена одного варианта предмета на Skinport, USD. */
export type SkinPrice = {
  wear: SkinWear | null
  variant: SkinVariant
  marketHashName: string
  min: number | null
  median: number | null
  suggested: number | null
  quantity: number
  itemPage: string | null
}

/** Облегчённая карточка для каталогов: без описания и таблицы цен. */
export type SkinSummary = {
  id: string
  slug: Slug
  name: string
  weapon: string
  weaponSlug: Slug
  pattern: string | null
  phase: string | null
  category: SkinCategory
  rarity: SkinRarity
  rarityColor: string
  image: string | null
  stattrak: boolean
  souvenir: boolean
  /** Самое дешёвое обычное предложение среди износов. */
  fromPrice: number | null
  /** Медиана продаж обычного варианта в самом популярном износе. */
  typicalPrice: number | null
  listings: number
}

export type Skin = SkinSummary & {
  description: string | null
  lore: string | null
  minFloat: number | null
  maxFloat: number | null
  wears: SkinWear[]
  team: "t" | "ct" | "both" | null
  collections: SkinRef[]
  crates: SkinRef[]
  prices: SkinPrice[]
  /** У допплеров фазы продаются под одним названием — цена общая на все фазы. */
  phaseAgnosticPrice: boolean
}

export type SkinWeapon = {
  name: string
  slug: Slug
  category: SkinCategory
  count: number
  image: string | null
  fromPrice: number | null
}

export type SkinSort = "popular" | "price-desc" | "price-asc" | "rarity" | "name"

export const SORT_LABEL: Record<SkinSort, string> = {
  popular: "Популярные",
  "price-desc": "Сначала дорогие",
  "price-asc": "Сначала дешёвые",
  rarity: "По редкости",
  name: "По названию",
}
