import { cacheTag } from "next/cache"
import { z } from "zod"

import { apiError, fail, fetchJson, ok } from "@/shared/api"
import type { ApiResult } from "@/shared/api"
import { MARKET_TAG } from "@/shared/config"
import { cacheFor } from "@/shared/lib/cache"
import { toSlug } from "@/shared/model"
import type { Slug } from "@/shared/model"

import { getSkinCatalog, loadPriceIndex, skinportPage } from "@/entities/skin/@x/crate"
import type { PriceRow, SkinRarity, SkinSummary } from "@/entities/skin/@x/crate"

import { CRATE_ODDS, KEY_PRICE } from "../model/crate"
import type { Crate, CrateItem, CrateRarityGroup, CrateSummary } from "../model/crate"

const CRATES_URL = "https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en/crates.json"

const itemSchema = z.object({
  id: z.string(),
  name: z.string(),
  image: z.string().nullable().catch(null),
  rarity: z.object({ name: z.string() }).nullable().catch(null),
})

const crateSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  type: z.string().nullable().catch(null),
  image: z.string().nullable().catch(null),
  first_sale_date: z.string().nullable().catch(null),
  market_hash_name: z.string().nullable().catch(null),
  contains: z.array(itemSchema).catch([]),
  contains_rare: z.array(itemSchema).catch([]),
  loot_list: z.object({ footer: z.string().nullable().catch(null) }).nullable().catch(null),
})

type RawItem = { id: string; name: string; image: string | null; rarity: SkinRarity | null }

type CrateRecord = {
  id: string
  slug: Slug
  name: string
  image: string | null
  releasedAt: string | null
  marketHashName: string
  contains: RawItem[]
  rare: RawItem[]
  rareLabel: string | null
}

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

function toItem(raw: z.infer<typeof itemSchema>): RawItem {
  return {
    id: raw.id,
    name: raw.name,
    image: raw.image,
    rarity: RARITY_BY_NAME[raw.rarity?.name ?? ""] ?? null,
  }
}

/** Оружейные кейсы: сувенирные наборы и капсулы наклеек устроены иначе. */
async function loadCrateRecords(): Promise<ApiResult<CrateRecord[]>> {
  "use cache"
  cacheTag(MARKET_TAG)

  const result = await fetchJson(CRATES_URL, z.array(z.unknown()))

  cacheFor("reference", result.ok)

  if (!result.ok) return result

  return ok(
    result.data
      .map((raw) => crateSchema.safeParse(raw))
      .flatMap((entry) => {
        if (!entry.success || entry.data.type !== "Case" || entry.data.contains.length === 0) {
          return []
        }

        const crate = entry.data

        return [
          {
            id: crate.id,
            slug: toSlug(crate.name),
            name: crate.name,
            image: crate.image,
            releasedAt: crate.first_sale_date,
            marketHashName: crate.market_hash_name ?? crate.name,
            contains: crate.contains.map(toItem),
            rare: crate.contains_rare.map(toItem),
            // «or an Exceedingly Rare Kukri Knife!» → «Kukri Knife»: остальное скажем по-русски.
            rareLabel:
              crate.loot_list?.footer
                ?.replace(/^or an?\s+/i, "")
                .replace(/^exceedingly rare\s+/i, "")
                .replace(/!$/, "")
                .trim() ?? null,
          },
        ]
      }),
  )
}

function releaseDate(raw: string | null): Date | null {
  const time = raw === null ? Number.NaN : Date.parse(raw)

  return Number.isFinite(time) ? new Date(time) : null
}

function summarize(record: CrateRecord, prices: Map<string, PriceRow>): CrateSummary {
  const row = prices.get(record.marketHashName)

  return {
    id: record.id,
    slug: record.slug,
    name: record.name,
    image: record.image,
    releasedAt: releaseDate(record.releasedAt),
    price: row?.[1] ?? row?.[3] ?? null,
    itemCount: record.contains.length,
    rareLabel: record.rareLabel,
    listings: row?.[4] ?? 0,
  }
}

async function priceMap(): Promise<Map<string, PriceRow>> {
  const index = await loadPriceIndex()

  return new Map((index.ok ? index.data : []).map((row) => [row[0], row]))
}

export async function getCrateCatalog(): Promise<ApiResult<CrateSummary[]>> {
  "use cache"
  cacheTag(MARKET_TAG)

  const [records, prices] = await Promise.all([loadCrateRecords(), priceMap()])

  cacheFor("prices", records.ok && prices.size > 0)

  if (!records.ok) return records

  return ok(
    records.data
      .map((record) => summarize(record, prices))
      .sort(
        (left, right) =>
          (right.releasedAt?.getTime() ?? 0) - (left.releasedAt?.getTime() ?? 0),
      ),
  )
}

function average(items: readonly CrateItem[]): number | null {
  const priced = items.map((item) => item.price).filter((price): price is number => price !== null)

  return priced.length === 0 ? null : priced.reduce((sum, price) => sum + price, 0) / priced.length
}

function priced(raw: RawItem, catalog: Map<string, SkinSummary>, fallback: SkinRarity): CrateItem {
  const skin = catalog.get(raw.id)

  return {
    id: raw.id,
    slug: skin?.slug ?? null,
    name: raw.name,
    image: raw.image ?? skin?.image ?? null,
    rarity: raw.rarity ?? skin?.rarity ?? fallback,
    price: skin?.typicalPrice ?? skin?.fromPrice ?? null,
  }
}

export async function getCrateBySlug(slug: string): Promise<ApiResult<Crate>> {
  "use cache"
  cacheTag(MARKET_TAG)

  const [records, prices, catalog] = await Promise.all([
    loadCrateRecords(),
    priceMap(),
    getSkinCatalog(),
  ])

  cacheFor("prices", records.ok && prices.size > 0 && catalog.ok)

  if (!records.ok) return records

  const record = records.data.find((entry) => entry.slug === slug)

  if (record === undefined) return fail(apiError("not-found", `Кейс «${slug}» не найден`, 404))

  const skins = new Map((catalog.ok ? catalog.data : []).map((skin) => [skin.id, skin]))
  const items = record.contains.map((raw) => priced(raw, skins, "milspec"))

  const groups: CrateRarityGroup[] = (["covert", "classified", "restricted", "milspec"] as const)
    .map((rarity): CrateRarityGroup => {
      const members = items
        .filter((item) => item.rarity === rarity)
        .sort((left, right) => (right.price ?? 0) - (left.price ?? 0))

      return { rarity, chance: CRATE_ODDS[rarity], items: members, averagePrice: average(members) }
    })
    .filter((group) => group.items.length > 0)

  const rare = record.rare
    .map((raw) => priced(raw, skins, "covert"))
    .sort((left, right) => (right.price ?? 0) - (left.price ?? 0))

  if (rare.length > 0) {
    groups.unshift({ rarity: "rare", chance: CRATE_ODDS.rare, items: rare, averagePrice: average(rare) })
  }

  // Оценку даём, только если оценена каждая группа: иначе она заметно врёт вниз.
  const complete = groups.length > 0 && groups.every((group) => group.averagePrice !== null)
  const expectedValue = complete
    ? groups.reduce((sum, group) => sum + group.chance * (group.averagePrice ?? 0), 0)
    : null

  const summary = summarize(record, prices)

  return ok({
    ...summary,
    groups,
    expectedValue,
    openCost: summary.price === null ? null : summary.price + KEY_PRICE,
    itemPage: skinportPage(prices.get(record.marketHashName)?.[5] ?? null),
  })
}
