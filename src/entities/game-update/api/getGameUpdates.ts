import { cacheTag } from "next/cache"
import { z } from "zod"

import { apiError, fail, fetchJson, ok } from "@/shared/api"
import type { ApiResult } from "@/shared/api"
import { GAME_TAG } from "@/shared/config"
import { cacheFor } from "@/shared/lib/cache"

import { countChanges, parseSteamNotes } from "../lib/parseSteamNotes"
import type { GameUpdate, GameUpdateSummary, OnlinePlayers, UpdateBlock } from "../model/gameUpdate"

const APP_ID = 730
const NEWS_URL = `https://api.steampowered.com/ISteamNews/GetNewsForApp/v2/?appid=${APP_ID}&count=60&format=json`
const PLAYERS_URL = `https://api.steampowered.com/ISteamUserStats/GetNumberOfCurrentPlayers/v1/?appid=${APP_ID}`
/** Только собственные анонсы Valve: пересказы СМИ перепечатывать нельзя. */
const OFFICIAL_FEED = "steam_community_announcements"
const EXCERPT_LENGTH = 180

const newsSchema = z.object({
  appnews: z.object({
    newsitems: z.array(
      z.object({
        gid: z.string(),
        title: z.string(),
        url: z.string(),
        contents: z.string(),
        feedname: z.string(),
        date: z.number().int(),
      }),
    ),
  }),
})

const playersSchema = z.object({
  response: z.object({ player_count: z.number().int().nonnegative(), result: z.number().int() }),
})

const dayFormat = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
})

function isoDay(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function plainText(blocks: readonly UpdateBlock[]): string {
  for (const block of blocks) {
    if (block.kind === "paragraph") return block.text
    if (block.kind === "list" && block.items[0] !== undefined) return block.items[0].text
  }

  return ""
}

function excerpt(text: string): string {
  if (text.length <= EXCERPT_LENGTH) return text

  const cut = text.slice(0, EXCERPT_LENGTH)
  const space = cut.lastIndexOf(" ")

  return `${cut.slice(0, space > 80 ? space : EXCERPT_LENGTH)}…`
}

function toUpdate(item: z.infer<typeof newsSchema>["appnews"]["newsitems"][number]): GameUpdate {
  const publishedAt = new Date(item.date * 1000)
  const blocks = parseSteamNotes(item.contents)
  const patch = /^counter-strike 2 update$/i.test(item.title.trim())
  // Обложка — первая картинка или кадр-постер ролика Valve.
  const media = blocks.find((block) => block.kind === "image" || (block.kind === "video" && block.poster !== null))
  const cover = media?.kind === "image" ? media.src : media?.kind === "video" ? media.poster : null

  return {
    id: item.gid,
    // Дата в адресе хорошо ранжируется по запросам «обновление кс2 9 сентября»,
    // хвост gid делает адрес уникальным при нескольких патчах за день.
    slug: `${isoDay(publishedAt)}-${item.gid.slice(-6)}`,
    kind: patch ? "patch" : "announcement",
    title: patch ? `Обновление CS2 от ${dayFormat.format(publishedAt)}` : item.title,
    originalTitle: item.title,
    publishedAt,
    excerpt: excerpt(plainText(blocks)),
    cover,
    changeCount: countChanges(blocks),
    sections: blocks.flatMap((block) => (block.kind === "heading" ? [block.text] : [])),
    blocks,
    sourceUrl: item.url,
  }
}

async function loadUpdates(): Promise<ApiResult<GameUpdate[]>> {
  "use cache"
  cacheTag(GAME_TAG)

  const result = await fetchJson(NEWS_URL, newsSchema)

  cacheFor("feed", result.ok)

  if (!result.ok) return result

  return ok(
    result.data.appnews.newsitems
      .filter((item) => item.feedname === OFFICIAL_FEED)
      .map(toUpdate)
      .sort((left, right) => right.publishedAt.getTime() - left.publishedAt.getTime()),
  )
}

export async function getGameUpdates(): Promise<ApiResult<GameUpdateSummary[]>> {
  const result = await loadUpdates()

  if (!result.ok) return result

  // Тело патча в списках не нужно: без него кэш и RSC-пейлоад в разы легче.
  return ok(
    result.data.map((update) => ({
      id: update.id,
      slug: update.slug,
      kind: update.kind,
      title: update.title,
      originalTitle: update.originalTitle,
      publishedAt: update.publishedAt,
      excerpt: update.excerpt,
      cover: update.cover,
      changeCount: update.changeCount,
      sections: update.sections,
    })),
  )
}

export async function getGameUpdateBySlug(slug: string): Promise<ApiResult<GameUpdate>> {
  const result = await loadUpdates()

  if (!result.ok) return result

  const update = result.data.find((entry) => entry.slug === slug)

  return update === undefined
    ? fail(apiError("not-found", `Обновление «${slug}» не найдено`, 404))
    : ok(update)
}

/** Сколько человек сейчас в игре — по данным Steam. */
export async function getOnlinePlayers(): Promise<ApiResult<OnlinePlayers>> {
  "use cache"
  cacheTag(GAME_TAG)

  const result = await fetchJson(PLAYERS_URL, playersSchema)

  cacheFor("feed", result.ok && result.data.response.result === 1)

  if (!result.ok) return result
  if (result.data.response.result !== 1) return fail(apiError("http", "Steam не вернул онлайн"))

  return ok({ count: result.data.response.player_count, fetchedAt: new Date() })
}
