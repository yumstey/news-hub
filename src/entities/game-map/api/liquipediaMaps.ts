import { cacheTag } from "next/cache"

import { fetchText, ok } from "@/shared/api"
import type { ApiResult } from "@/shared/api"
import { matchTag, teamTag, tournamentTag } from "@/shared/config"
import { cacheFor } from "@/shared/lib/cache"

const API = "https://liquipedia.net/counterstrike/api.php"
const CANDIDATES = 3
/** Дата на вики указана в местном времени турнира — допускаем расхождение в сутки. */
const DATE_TOLERANCE_MS = 36 * 60 * 60 * 1000
/** Через сутки после начала матча вики уже дописала карты — можно кэшировать надолго. */
const SETTLED_AFTER_MS = 24 * 60 * 60 * 1000

/** Половина карты: сторона и взятые на ней раунды. */
export type MapHalf = {
  side: "t" | "ct"
  first: number
  second: number
}

export type MapResult = {
  /** Название так, как его пишет источник: «Dust II». */
  name: string
  played: boolean
  first: number
  second: number
  /** Половины первой команды; null — если счёт по сторонам не указан. */
  halves: [MapHalf, MapHalf] | null
  vod: string | null
}

export type MatchMaps = {
  maps: MapResult[]
  hltvUrl: string | null
  source: string | null
}

export const EMPTY_MATCH_MAPS: MatchMaps = { maps: [], hltvUrl: null, source: null }

/** Сколько турнир наиграл на карте и как делились стороны. */
export type MapUsage = {
  name: string
  played: number
  /** Сколько раз карту оставляли решающей, но не играли. */
  skipped: number
  ctRounds: number
  tRounds: number
}

export type EventMapStats = {
  maps: MapUsage[]
  matches: number
  source: string | null
}

export const EMPTY_EVENT_MAP_STATS: EventMapStats = { maps: [], matches: 0, source: null }

type WikiMap = {
  name: string
  played: boolean
  scores: [number, number]
  halves: [MapHalf, MapHalf] | null
  vod: string | null
}

type WikiMatch = {
  opponents: [string, string]
  date: number | null
  hltvId: string | null
  maps: WikiMap[]
}

function normalize(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .replace(/^(team|the)/, "")
    .replace(/(esports?|gaming|gamingclub|club|academy)$/, "")
}

/**
 * Liquipedia зовёт команды короткими алиасами (navi, vit, ic), поэтому
 * сверяем и полное имя, и аббревиатуру из PandaScore.
 */
function sameTeam(token: string, names: readonly string[]): boolean {
  const left = normalize(token)

  if (left.length === 0) return false

  return names.some((name) => {
    const right = normalize(name)

    if (right.length === 0) return false
    if (left === right) return true

    return left.length >= 3 && (right.startsWith(left) || left.startsWith(right))
  })
}

/** Возвращает содержимое шаблона, начинающегося на `from`, со сбалансированными скобками. */
function template(content: string, from: number): string | null {
  let depth = 0

  for (let index = from; index < content.length - 1; index += 1) {
    const pair = content.slice(index, index + 2)

    if (pair === "{{") {
      depth += 1
      index += 1
      continue
    }

    if (pair === "}}") {
      depth -= 1

      if (depth === 0) return content.slice(from, index + 2)

      index += 1
    }
  }

  return null
}

function field(block: string, name: string): string | null {
  const match = new RegExp(`\\|${name}=([^|}\\n]*)`, "i").exec(block)
  const value = match?.[1]?.trim()

  return value === undefined || value.length === 0 ? null : value
}

function number(block: string, name: string): number {
  const raw = field(block, name)
  const value = raw === null ? Number.NaN : Number.parseInt(raw, 10)

  return Number.isFinite(value) ? value : 0
}

/** Суммирует основное время и все овертаймы одной команды. */
function totalOf(block: string, team: 1 | 2): number {
  let total = number(block, `t${team}t`) + number(block, `t${team}ct`)

  for (let overtime = 1; overtime <= 6; overtime += 1) {
    total += number(block, `o${overtime}t${team}t`) + number(block, `o${overtime}t${team}ct`)
  }

  return total
}

function halvesOf(block: string): [MapHalf, MapHalf] | null {
  const firstSide = field(block, "t1firstside")?.toLowerCase()

  if (firstSide !== "t" && firstSide !== "ct") return null

  const second = firstSide === "t" ? "ct" : "t"

  return [
    {
      side: firstSide,
      first: number(block, `t1${firstSide}`),
      second: number(block, `t2${second}`),
    },
    {
      side: second,
      first: number(block, `t1${second}`),
      second: number(block, `t2${firstSide}`),
    },
  ]
}

function parseMaps(block: string): WikiMap[] {
  const maps: WikiMap[] = []

  for (let index = 0; index < 9; index += 1) {
    const marker = block.indexOf(`|map${index + 1}={{Map`)

    if (marker < 0) continue

    const map = template(block, block.indexOf("{{Map", marker))

    if (map === null) continue

    const name = field(map, "map")

    if (name === null) continue

    const finished = field(map, "finished")?.toLowerCase()

    maps.push({
      name,
      played: finished === "true",
      scores: [totalOf(map, 1), totalOf(map, 2)],
      halves: halvesOf(map),
      vod: field(map, "vod"),
    })
  }

  return maps
}

/** На вики дата записана как «August 26, 2026 - 13:55 {{Abbr/CEST}}». */
function parseDate(raw: string | null): number | null {
  if (raw === null) return null

  const day = /([A-Z][a-z]+\s+\d{1,2},\s*\d{4})/.exec(raw)

  if (day?.[1] === undefined) return null

  const time = Date.parse(`${day[1].replace(/\s+/g, " ")} UTC`)

  return Number.isFinite(time) ? time : null
}

export function parseEventMatches(content: string): WikiMatch[] {
  const matches: WikiMatch[] = []
  let cursor = content.indexOf("{{Match")

  while (cursor >= 0) {
    const block = template(content, cursor)

    cursor = content.indexOf("{{Match", cursor + 7)

    if (block === null) continue

    const opponents = [...block.matchAll(/\{\{TeamOpponent\|([^}|]+)/g)].map((entry) =>
      (entry[1] ?? "").trim(),
    )

    if (opponents.length < 2) continue

    const [first, second] = opponents

    if (first === undefined || second === undefined) continue

    matches.push({
      opponents: [first, second],
      date: parseDate(field(block, "date")),
      hltvId: field(block, "hltv"),
      maps: parseMaps(block),
    })
  }

  return matches
}

async function wikiJson(url: string): Promise<unknown> {
  const result = await fetchText(url)

  if (!result.ok) return null

  try {
    return JSON.parse(result.data)
  } catch {
    return null
  }
}

/** Кандидаты страниц турнира. null — сбой запроса, [] — вики ничего не нашла. */
async function searchPages(query: string): Promise<string[] | null> {
  "use cache"

  const url = `${API}?action=query&list=search&srsearch=${encodeURIComponent(query)}&srlimit=6&srnamespace=0&format=json&formatversion=2`
  const body = await wikiJson(url)
  const hits = (body as { query?: { search?: { title?: string }[] } } | null)?.query?.search

  cacheFor("reference", Array.isArray(hits))

  if (!Array.isArray(hits)) return null

  return hits
    .map((hit) => hit.title)
    .filter((title): title is string => typeof title === "string")
    .slice(0, CANDIDATES)
}

/** Матчи со страницы турнира. null — сбой запроса; пока турнир идёт, страница меняется. */
async function loadEvent(title: string): Promise<WikiMatch[] | null> {
  "use cache"

  const url = `${API}?action=query&prop=revisions&titles=${encodeURIComponent(title.replace(/\s+/g, "_"))}&rvprop=content&rvslots=main&format=json&formatversion=2&redirects=1`
  const body = await wikiJson(url)
  const pages = (body as { query?: { pages?: unknown[] } } | null)?.query?.pages

  cacheFor("schedule", Array.isArray(pages))

  if (!Array.isArray(pages)) return null
  if (pages.length === 0) return []

  const first = pages[0] as {
    missing?: boolean
    revisions?: { slots?: { main?: { content?: string } } }[]
  }

  if (first.missing === true) return []

  const content = first.revisions?.[0]?.slots?.main?.content

  return typeof content !== "string" ? [] : parseEventMatches(content)
}

function pick(
  matches: readonly WikiMatch[],
  home: readonly string[],
  away: readonly string[],
  startsAt: number,
): { match: WikiMatch; swapped: boolean } | null {
  for (const match of matches) {
    if (match.date !== null && Math.abs(match.date - startsAt) > DATE_TOLERANCE_MS) continue

    const [left, right] = match.opponents

    if (sameTeam(left, home) && sameTeam(right, away)) return { match, swapped: false }
    if (sameTeam(left, away) && sameTeam(right, home)) return { match, swapped: true }
  }

  return null
}

function orient(map: WikiMap, swapped: boolean): MapResult {
  const [first, second] = swapped ? [map.scores[1], map.scores[0]] : map.scores
  const halves =
    map.halves === null
      ? null
      : swapped
        ? (map.halves.map((half) => ({
            side: half.side === "t" ? ("ct" as const) : ("t" as const),
            first: half.second,
            second: half.first,
          })) as [MapHalf, MapHalf])
        : map.halves

  return { name: map.name, played: map.played, first, second, halves, vod: map.vod }
}

/**
 * Карты матча с Liquipedia: PandaScore на текущем тарифе отдаёт только номер
 * игры, поэтому названия карт, счёт по половинам и записи берутся из вики.
 */
export async function getMatchMaps(
  matchId: string,
  eventQuery: string,
  home: readonly string[],
  away: readonly string[],
  startsAtIso: string,
): Promise<ApiResult<MatchMaps>> {
  "use cache"
  cacheTag(matchTag(matchId))

  const startsAt = Date.parse(startsAtIso)
  const settled = Number.isFinite(startsAt) && Date.now() - startsAt > SETTLED_AFTER_MS

  if (!Number.isFinite(startsAt) || eventQuery.trim().length === 0) {
    cacheFor("reference", true)

    return ok(EMPTY_MATCH_MAPS)
  }

  const titles = await searchPages(eventQuery)
  let healthy = titles !== null

  for (const title of titles ?? []) {
    const matches = await loadEvent(title)

    healthy = healthy && matches !== null

    const found = pick(matches ?? [], home, away, startsAt)

    if (found === null) continue

    cacheFor(settled ? "reference" : "schedule", healthy)

    return ok({
      maps: found.match.maps.map((map) => orient(map, found.swapped)),
      hltvUrl:
        found.match.hltvId === null
          ? null
          : `https://www.hltv.org/matches/${found.match.hltvId}/-`,
      source: `https://liquipedia.net/counterstrike/${encodeURIComponent(title.replace(/\s+/g, "_"))}`,
    })
  }

  // Матча нет на вики: у свежего он может появиться в течение дня.
  cacheFor(settled ? "reference" : "schedule", healthy)

  return ok(EMPTY_MATCH_MAPS)
}

/** Как команда играет на карте: победы, поражения и взятые раунды. */
export type TeamMapRecord = {
  name: string
  wins: number
  losses: number
  roundsWon: number
  roundsLost: number
}

export type TeamMapPool = {
  maps: TeamMapRecord[]
  events: number
}

export const EMPTY_MAP_POOL: TeamMapPool = { maps: [], events: 0 }

/**
 * Карта-пул команды: страницы турниров, где она играла, разбираются тем же
 * парсером, а результаты разворачиваются на сторону команды.
 */
export async function getTeamMapPool(
  teamSlug: string,
  teams: readonly string[],
  eventQueries: readonly string[],
): Promise<ApiResult<TeamMapPool>> {
  "use cache"
  cacheTag(teamTag(teamSlug))

  const pool = new Map<string, TeamMapRecord>()
  let events = 0
  let healthy = true

  for (const query of eventQueries) {
    const cleaned = query.replace(/[:#]/g, " ").trim()

    if (cleaned.length === 0) continue

    // Первый результат поиска бывает категорией, поэтому берём ту страницу,
    // на которой команда действительно нашлась.
    const titles = await searchPages(cleaned)

    healthy = healthy && titles !== null

    for (const title of titles ?? []) {
      const matches = await loadEvent(title)

      healthy = healthy && matches !== null

      const mineInEvent = (matches ?? []).flatMap((match) => {
        const [left, right] = match.opponents
        const side = sameTeam(left, teams) ? 0 : sameTeam(right, teams) ? 1 : null

        return side === null ? [] : [{ side, maps: match.maps }]
      })

      if (mineInEvent.length === 0) continue

      events += 1

      for (const { side, maps } of mineInEvent) {
        for (const map of maps) {
          if (!map.played) continue

          const own = map.scores[side] ?? 0
          const rival = map.scores[side === 0 ? 1 : 0] ?? 0
          const entry = pool.get(map.name) ?? {
            name: map.name,
            wins: 0,
            losses: 0,
            roundsWon: 0,
            roundsLost: 0,
          }

          if (own > rival) entry.wins += 1
          else entry.losses += 1

          entry.roundsWon += own
          entry.roundsLost += rival
          pool.set(map.name, entry)
        }
      }

      break
    }
  }

  cacheFor("reference", healthy)

  return ok({
    maps: [...pool.values()].sort(
      (left, right) =>
        right.wins + right.losses - (left.wins + left.losses) || right.wins - left.wins,
    ),
    events,
  })
}

/** Считает, сколько команд турнира встретилось на странице — так проверяем, что нашли ту. */
function looksLikeEvent(matches: readonly WikiMatch[], teams: readonly string[]): boolean {
  if (matches.length === 0) return false

  const known = new Set<string>()

  for (const match of matches) {
    for (const token of match.opponents) {
      if (sameTeam(token, teams)) known.add(normalize(token))
    }
  }

  return known.size >= 2
}

/**
 * Карта-статистика турнира: та же страница вики, что и для матчей, поэтому
 * данные достаются без дополнительных запросов.
 */
export async function getEventMapStats(
  tournamentId: string,
  eventQuery: string,
  teams: readonly string[],
): Promise<ApiResult<EventMapStats>> {
  "use cache"
  cacheTag(tournamentTag(tournamentId))

  if (eventQuery.trim().length === 0 || teams.length === 0) {
    cacheFor("reference", true)

    return ok(EMPTY_EVENT_MAP_STATS)
  }

  const titles = await searchPages(eventQuery)
  let healthy = titles !== null

  for (const title of titles ?? []) {
    const loaded = await loadEvent(title)

    healthy = healthy && loaded !== null

    const matches = loaded ?? []

    if (!looksLikeEvent(matches, teams)) continue

    cacheFor("schedule", healthy)

    const usage = new Map<string, MapUsage>()

    for (const match of matches) {
      for (const map of match.maps) {
        const entry = usage.get(map.name) ?? {
          name: map.name,
          played: 0,
          skipped: 0,
          ctRounds: 0,
          tRounds: 0,
        }

        if (!map.played) {
          entry.skipped += 1
          usage.set(map.name, entry)
          continue
        }

        entry.played += 1

        for (const half of map.halves ?? []) {
          const rounds = half.first + half.second

          if (half.side === "ct") entry.ctRounds += rounds
          else entry.tRounds += rounds
        }

        usage.set(map.name, entry)
      }
    }

    return ok({
      maps: [...usage.values()].sort(
        (left, right) => right.played - left.played || left.name.localeCompare(right.name),
      ),
      matches: matches.filter((match) => match.maps.some((map) => map.played)).length,
      source: `https://liquipedia.net/counterstrike/${encodeURIComponent(title.replace(/\s+/g, "_"))}`,
    })
  }

  cacheFor("schedule", healthy)

  return ok(EMPTY_EVENT_MAP_STATS)
}
