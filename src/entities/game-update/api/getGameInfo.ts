import { cacheTag } from "next/cache"
import { z } from "zod"

import { fetchJson, ok } from "@/shared/api"
import type { ApiResult } from "@/shared/api"
import { GAME_TAG } from "@/shared/config"
import { cacheFor } from "@/shared/lib/cache"

const APP_ID = 730
const DETAILS_URL = `https://store.steampowered.com/api/appdetails?appids=${APP_ID}&l=russian&cc=us`
const STEAM_CDN = `https://cdn.akamai.steamstatic.com/steam/apps/${APP_ID}`

export type GameScreenshot = {
  thumb: string
  full: string
}

export type GameTrailer = {
  id: string
  name: string
  thumb: string
}

export type GameRequirement = {
  label: string
  value: string
}

export type GameInfo = {
  name: string
  description: string
  screenshots: GameScreenshot[]
  trailers: GameTrailer[]
  requirements: GameRequirement[]
  reviews: number | null
  genres: string[]
  platforms: string[]
  storeUrl: string
  /** Широкий арт библиотеки Steam 3840×1240 — фон для героев. */
  hero: string
  logo: string
}

/** Картинки, которые есть у любого приложения Steam, — работают и без appdetails. */
export const STEAM_ART = {
  hero: `${STEAM_CDN}/library_hero.jpg`,
  logo: `${STEAM_CDN}/logo.png`,
  header: `${STEAM_CDN}/header.jpg`,
} as const

const detailsSchema = z.record(
  z.string(),
  z.object({
    success: z.boolean(),
    data: z
      .object({
        name: z.string(),
        short_description: z.string().catch(""),
        screenshots: z
          .array(z.object({ path_thumbnail: z.string(), path_full: z.string() }))
          .catch([]),
        movies: z
          .array(z.object({ id: z.number(), name: z.string(), thumbnail: z.string() }))
          .catch([]),
        pc_requirements: z
          .union([z.object({ minimum: z.string().catch("") }), z.array(z.unknown())])
          .catch({ minimum: "" }),
        recommendations: z.object({ total: z.number() }).nullable().catch(null),
        genres: z.array(z.object({ description: z.string() })).catch([]),
        platforms: z.record(z.string(), z.boolean()).catch({}),
      })
      .optional(),
  }),
)

const PLATFORM_LABEL: Record<string, string> = { windows: "Windows", mac: "macOS", linux: "Linux" }

function decode(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/[®™]/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

/** «<li><strong>ОС:</strong> Windows 10</li>» → { label: "ОС", value: "Windows 10" }. */
function parseRequirements(html: string): GameRequirement[] {
  return [...html.matchAll(/<li>([\s\S]*?)<\/li>/gi)].flatMap((match) => {
    const text = decode(match[1] ?? "")
    const colon = text.indexOf(":")

    if (colon < 0) return []

    const label = text.slice(0, colon).trim()
    const value = text.slice(colon + 1).trim()

    return label.length === 0 || value.length === 0 ? [] : [{ label, value }]
  })
}

export const EMPTY_GAME_INFO: GameInfo = {
  name: "Counter-Strike 2",
  description: "",
  screenshots: [],
  trailers: [],
  requirements: [],
  reviews: null,
  genres: [],
  platforms: [],
  storeUrl: `https://store.steampowered.com/app/${APP_ID}/`,
  hero: STEAM_ART.hero,
  logo: STEAM_ART.logo,
}

/** Карточка игры из магазина Steam на русском: описание, скриншоты, трейлеры, системные требования. */
export async function getGameInfo(): Promise<ApiResult<GameInfo>> {
  "use cache"
  cacheTag(GAME_TAG)

  const result = await fetchJson(DETAILS_URL, detailsSchema)
  const data = result.ok ? result.data[String(APP_ID)]?.data : undefined

  cacheFor("reference", data !== undefined)

  if (data === undefined) return ok(EMPTY_GAME_INFO)

  const requirements = Array.isArray(data.pc_requirements) ? "" : data.pc_requirements.minimum

  return ok({
    ...EMPTY_GAME_INFO,
    name: data.name,
    description: decode(data.short_description),
    screenshots: data.screenshots.map((shot) => ({ thumb: shot.path_thumbnail, full: shot.path_full })),
    trailers: data.movies.map((movie) => ({ id: String(movie.id), name: movie.name, thumb: movie.thumbnail })),
    requirements: parseRequirements(requirements),
    reviews: data.recommendations?.total ?? null,
    genres: data.genres.map((genre) => genre.description),
    platforms: Object.entries(data.platforms)
      .filter(([, supported]) => supported)
      .map(([key]) => PLATFORM_LABEL[key] ?? key),
  })
}
