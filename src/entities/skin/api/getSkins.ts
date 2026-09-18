import { cacheTag } from "next/cache"

import { apiError, fail, ok } from "@/shared/api"
import type { ApiResult } from "@/shared/api"
import { MARKET_TAG } from "@/shared/config"
import { cacheFor } from "@/shared/lib/cache"

import { marketHashName } from "../lib/marketName"
import { CATEGORY_ORDER, WEAR_ORDER } from "../model/skin"
import type {
  Skin,
  SkinPrice,
  SkinSummary,
  SkinVariant,
  SkinWeapon,
  SkinWear,
} from "../model/skin"
import { loadPriceIndex, loadSkinRecords, skinportPage } from "./skinSources"
import type { PriceRow, SkinRecord } from "./skinSources"

const RELATED_LIMIT = 12

type PriceMap = Map<string, PriceRow>

function priceMap(rows: readonly PriceRow[]): PriceMap {
  return new Map(rows.map((row) => [row[0], row]))
}

function variantsOf(record: SkinRecord): SkinVariant[] {
  return [
    "normal",
    ...(record.stattrak ? (["stattrak"] as const) : []),
    ...(record.souvenir ? (["souvenir"] as const) : []),
  ]
}

function pricesOf(record: SkinRecord, prices: PriceMap): SkinPrice[] {
  const wears: (SkinWear | null)[] = record.wears.length === 0 ? [null] : WEAR_ORDER.filter((wear) => record.wears.includes(wear))
  const rows: SkinPrice[] = []

  for (const variant of variantsOf(record)) {
    for (const wear of wears) {
      const name = marketHashName(record.name, variant, wear)
      const row = prices.get(name)

      rows.push({
        wear,
        variant,
        marketHashName: name,
        min: row?.[1] ?? null,
        median: row?.[2] ?? null,
        suggested: row?.[3] ?? null,
        quantity: row?.[4] ?? 0,
        itemPage: skinportPage(row?.[5] ?? null),
      })
    }
  }

  return rows
}

function summarize(record: SkinRecord, prices: SkinPrice[]): SkinSummary {
  const normal = prices.filter((price) => price.variant === "normal")
  const listed = normal.map((price) => price.min).filter((value): value is number => value !== null)
  const liquid = [...normal].sort((left, right) => right.quantity - left.quantity)[0]

  return {
    id: record.id,
    slug: record.slug,
    name: record.name,
    weapon: record.weapon,
    weaponSlug: record.weaponSlug,
    pattern: record.pattern,
    phase: record.phase,
    category: record.category,
    rarity: record.rarity,
    rarityColor: record.rarityColor,
    image: record.image,
    stattrak: record.stattrak,
    souvenir: record.souvenir,
    fromPrice: listed.length === 0 ? null : Math.min(...listed),
    typicalPrice: liquid?.median ?? liquid?.suggested ?? null,
    listings: normal.reduce((sum, price) => sum + price.quantity, 0),
  }
}

/** Каталог скинов с ценами — основа списков, фильтров и карты сайта. */
export async function getSkinCatalog(): Promise<ApiResult<SkinSummary[]>> {
  "use cache"
  cacheTag(MARKET_TAG)

  const [records, index] = await Promise.all([loadSkinRecords(), loadPriceIndex()])

  cacheFor("prices", records.ok && index.ok)

  if (!records.ok) return records

  const prices = priceMap(index.ok ? index.data : [])

  return ok(records.data.map((record) => summarize(record, pricesOf(record, prices))))
}

export type SkinDetail = {
  skin: Skin
  related: SkinSummary[]
}

export async function getSkinBySlug(slug: string): Promise<ApiResult<SkinDetail>> {
  "use cache"
  cacheTag(MARKET_TAG)

  const [records, index] = await Promise.all([loadSkinRecords(), loadPriceIndex()])

  cacheFor("prices", records.ok && index.ok)

  if (!records.ok) return records

  const record = records.data.find((entry) => entry.slug === slug)

  if (record === undefined) return fail(apiError("not-found", `Скин «${slug}» не найден`, 404))

  const prices = priceMap(index.ok ? index.data : [])
  const rows = pricesOf(record, prices)
  const { collections, crates, description, lore, minFloat, maxFloat, wears, team } = record

  const related = records.data
    .filter((entry) => entry.weaponSlug === record.weaponSlug && entry.id !== record.id)
    .map((entry) => summarize(entry, pricesOf(entry, prices)))
    .sort((left, right) => right.listings - left.listings)
    .slice(0, RELATED_LIMIT)

  return ok({
    skin: {
      ...summarize(record, rows),
      description,
      lore,
      minFloat,
      maxFloat,
      wears,
      team,
      collections,
      crates,
      prices: rows,
      phaseAgnosticPrice: record.phase !== null,
    },
    related,
  })
}

/** Оружие с количеством раскрасок — для навигации «Скины на AK-47». */
export async function getSkinWeapons(): Promise<ApiResult<SkinWeapon[]>> {
  "use cache"
  cacheTag(MARKET_TAG)

  const catalog = await getSkinCatalog()

  cacheFor("prices", catalog.ok)

  if (!catalog.ok) return catalog

  const weapons = new Map<string, SkinWeapon & { top: number }>()

  for (const skin of catalog.data) {
    const entry = weapons.get(skin.weaponSlug) ?? {
      name: skin.weapon,
      slug: skin.weaponSlug,
      category: skin.category,
      count: 0,
      image: null,
      fromPrice: null,
      top: -1,
    }

    entry.count += 1

    if (skin.fromPrice !== null) {
      entry.fromPrice = entry.fromPrice === null ? skin.fromPrice : Math.min(entry.fromPrice, skin.fromPrice)
    }

    // Обложка оружия — самая ходовая раскраска: узнаваемее случайной.
    if (skin.listings > entry.top && skin.image !== null) {
      entry.image = skin.image
      entry.top = skin.listings
    }

    weapons.set(skin.weaponSlug, entry)
  }

  return ok(
    [...weapons.values()]
      .map((entry): SkinWeapon => ({
        name: entry.name,
        slug: entry.slug,
        category: entry.category,
        count: entry.count,
        image: entry.image,
        fromPrice: entry.fromPrice,
      }))
      .sort(
        (left, right) =>
          CATEGORY_ORDER.indexOf(left.category) - CATEGORY_ORDER.indexOf(right.category) ||
          right.count - left.count,
      ),
  )
}
