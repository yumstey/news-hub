import { cacheTag } from "next/cache"
import { z } from "zod"

import { fetchJson, ok } from "@/shared/api"
import type { ApiResult } from "@/shared/api"
import { MARKET_TAG } from "@/shared/config"
import { cacheFor } from "@/shared/lib/cache"
import { toSlug } from "@/shared/model"
import type { Slug } from "@/shared/model"

import { displayName } from "../lib/marketName"
import type { SkinCategory, SkinRarity, SkinRef, SkinWear } from "../model/skin"

const ITEMS_URL = "https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en/skins.json"
const PRICES_URL = "https://api.skinport.com/v1/items?app_id=730&currency=USD&tradable=0"
const SKINPORT_ITEM = "https://skinport.com/item/"

const refSchema = z.object({
  id: z.string(),
  name: z.string(),
  image: z.string().nullable().catch(null),
})

const itemSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  description: z.string().nullable().catch(null),
  weapon: z.object({ name: z.string() }).nullable().catch(null),
  category: z.object({ name: z.string() }).nullable().catch(null),
  pattern: z.object({ name: z.string() }).nullable().catch(null),
  min_float: z.number().nullable().catch(null),
  max_float: z.number().nullable().catch(null),
  rarity: z.object({ name: z.string(), color: z.string() }).nullable().catch(null),
  stattrak: z.boolean().catch(false),
  souvenir: z.boolean().catch(false),
  phase: z.string().nullable().catch(null),
  wears: z.array(z.object({ name: z.string() })).nullable().catch(null),
  collections: z.array(refSchema).catch([]),
  crates: z.array(refSchema).catch([]),
  team: z.object({ id: z.string() }).nullable().catch(null),
  image: z.string().nullable().catch(null),
})

const priceSchema = z.object({
  market_hash_name: z.string().min(1),
  min_price: z.number().nullable().catch(null),
  median_price: z.number().nullable().catch(null),
  suggested_price: z.number().nullable().catch(null),
  quantity: z.number().int().catch(0),
  item_page: z.string().nullable().catch(null),
})

/** Всё о скине, кроме цен: меняется только с обновлениями игры. */
export type SkinRecord = {
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
  description: string | null
  lore: string | null
  minFloat: number | null
  maxFloat: number | null
  wears: SkinWear[]
  team: "t" | "ct" | "both" | null
  collections: SkinRef[]
  crates: SkinRef[]
}

/** Компактная строка цены: [название, мин, медиана, рекомендуемая, лотов, путь страницы]. */
export type PriceRow = [
  name: string,
  min: number | null,
  median: number | null,
  suggested: number | null,
  quantity: number,
  page: string | null,
]

const RARITY_BY_NAME: Record<string, SkinRarity> = {
  "Consumer Grade": "consumer",
  "Industrial Grade": "industrial",
  "Mil-Spec Grade": "milspec",
  Restricted: "restricted",
  Classified: "classified",
  Covert: "covert",
  Extraordinary: "extraordinary",
  Contraband: "contraband",
}

const CATEGORY_BY_NAME: Record<string, SkinCategory> = {
  Rifles: "rifles",
  Pistols: "pistols",
  SMGs: "smgs",
  Heavy: "heavy",
  Knives: "knives",
  Gloves: "gloves",
  Equipment: "equipment",
}

const WEAR_BY_NAME: Record<string, SkinWear> = {
  "Factory New": "fn",
  "Minimal Wear": "mw",
  "Field-Tested": "ft",
  "Well-Worn": "ww",
  "Battle-Scarred": "bs",
}

function cleanText(raw: string): string {
  return raw
    .replace(/\\n|\n/g, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

/** Описание Valve: основной текст и курсивная «легенда» предмета отдельно. */
function splitDescription(raw: string | null): { description: string | null; lore: string | null } {
  if (raw === null) return { description: null, lore: null }

  const italic = /<i>([\s\S]*?)<\/i>/.exec(raw)
  const lore = italic?.[1] === undefined ? null : cleanText(italic[1])
  const description = cleanText(italic === null ? raw : raw.replace(italic[0], ""))

  return {
    description: description.length > 0 ? description : null,
    lore: lore !== null && lore.length > 0 ? lore : null,
  }
}

function teamOf(raw: string | undefined): SkinRecord["team"] {
  if (raw === "terrorists") return "t"
  if (raw === "counter-terrorists") return "ct"
  if (raw === "both") return "both"

  return null
}

function toRef(ref: z.infer<typeof refSchema>): SkinRef {
  return { id: ref.id, slug: toSlug(ref.name), name: ref.name, image: ref.image }
}

export async function loadSkinRecords(): Promise<ApiResult<SkinRecord[]>> {
  "use cache"
  cacheTag(MARKET_TAG)

  const result = await fetchJson(ITEMS_URL, z.array(z.unknown()))

  cacheFor("reference", result.ok)

  if (!result.ok) return result

  const parsed = result.data
    .map((raw) => itemSchema.safeParse(raw))
    .flatMap((entry) => (entry.success ? [entry.data] : []))
    // Стабильный порядок нужен, чтобы суффиксы у совпавших адресов не прыгали.
    .sort((left, right) => left.id.localeCompare(right.id))

  const taken = new Map<string, number>()
  const records: SkinRecord[] = []

  for (const item of parsed) {
    const rarity = RARITY_BY_NAME[item.rarity?.name ?? ""]
    const category = CATEGORY_BY_NAME[item.category?.name ?? ""]
    const weapon = item.weapon?.name

    if (rarity === undefined || category === undefined || weapon === undefined) continue

    const base = toSlug(`${displayName(item.name)}${item.phase === null ? "" : ` ${item.phase}`}`)
    const seen = taken.get(base) ?? 0

    taken.set(base, seen + 1)

    const { description, lore } = splitDescription(item.description)

    records.push({
      id: item.id,
      slug: seen === 0 ? base : toSlug(`${base}-${seen + 1}`),
      name: item.name,
      weapon,
      weaponSlug: toSlug(weapon),
      pattern: item.pattern?.name ?? null,
      phase: item.phase,
      category,
      rarity,
      rarityColor: item.rarity?.color ?? "#b0c3d9",
      image: item.image,
      stattrak: item.stattrak,
      souvenir: item.souvenir,
      description,
      lore,
      minFloat: item.min_float,
      maxFloat: item.max_float,
      wears: (item.wears ?? [])
        .map((wear) => WEAR_BY_NAME[wear.name])
        .filter((wear): wear is SkinWear => wear !== undefined),
      team: teamOf(item.team?.id),
      collections: item.collections.map(toRef),
      crates: item.crates.map(toRef),
    })
  }

  return ok(records)
}

/** Выгрузка Skinport: минимальные и медианные цены по всем предметам CS2. */
export async function loadPriceIndex(): Promise<ApiResult<PriceRow[]>> {
  "use cache"
  cacheTag(MARKET_TAG)

  const result = await fetchJson(PRICES_URL, z.array(z.unknown()))

  cacheFor("prices", result.ok)

  if (!result.ok) return result

  return ok(
    result.data
      .map((raw) => priceSchema.safeParse(raw))
      .flatMap((entry) => {
        if (!entry.success) return []

        const row = entry.data
        const page = row.item_page?.startsWith(SKINPORT_ITEM)
          ? row.item_page.slice(SKINPORT_ITEM.length)
          : null

        return [
          [
            row.market_hash_name,
            row.min_price,
            row.median_price,
            row.suggested_price,
            row.quantity,
            page,
          ] satisfies PriceRow,
        ]
      }),
  )
}

export function skinportPage(path: string | null): string | null {
  return path === null ? null : `${SKINPORT_ITEM}${path}`
}
