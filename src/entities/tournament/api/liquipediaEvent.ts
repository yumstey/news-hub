import { cacheTag } from "next/cache"

import { fetchText, ok } from "@/shared/api"
import type { ApiResult } from "@/shared/api"
import { tournamentTag } from "@/shared/config"
import { cacheFor } from "@/shared/lib/cache"

const API = "https://liquipedia.net/counterstrike/api.php"
const WIKI = "https://liquipedia.net/counterstrike"

const PRIZE_LIMIT = 8
const FORMAT_LIMIT = 10
const PARTICIPANT_LIMIT = 24

export type EventPrize = {
  /** «1», «3—4» — как в таблице распределения призовых. */
  place: string
  usd: number | null
}

export type EventParticipant = {
  team: string
  players: string[]
  coach: string | null
}

export type EventProfile = {
  /** Ссылка на страницу Liquipedia — обязательная атрибуция CC BY-SA. */
  page: string | null
  organizer: string | null
  series: string | null
  /** LAN или онлайн по данным вики. */
  offline: boolean | null
  prizeUsd: number | null
  tier: string | null
  /** Уровень по классификации Valve: Major, Wildcard и подобные. */
  valveTier: string | null
  country: string | null
  city: string | null
  venue: string | null
  website: string | null
  teamCount: number | null
  maps: string[]
  format: string[]
  prizes: EventPrize[]
  participants: EventParticipant[]
}

export const EMPTY_EVENT_PROFILE: EventProfile = {
  page: null,
  organizer: null,
  series: null,
  offline: null,
  prizeUsd: null,
  tier: null,
  valveTier: null,
  country: null,
  city: null,
  venue: null,
  website: null,
  teamCount: null,
  maps: [],
  format: [],
  prizes: [],
  participants: [],
}

/** Снимает вики-разметку: ссылки, шаблоны, сноски, жирный текст. */
function plain(raw: string): string {
  return raw
    .replace(/<ref[^>]*\/>/gi, "")
    .replace(/<ref[^>]*>[\s\S]*?<\/ref>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/\[\[(?:[^|\]]*\|)?([^\]]*)\]\]/g, "$1")
    .replace(/\[(?:https?:\/\/\S+) ([^\]]*)\]/g, "$1")
    .replace(/\{\{Abbr\/([^}|]*)(?:\|[^}]*)?\}\}/gi, "$1")
    .replace(/\{\{[^{}]*\}\}/g, "")
    .replace(/'''?/g, "")
    .replace(/<br\s*\/?>/gi, " · ")
    .replace(/<\/?[a-z][^>]*>/gi, "")
    .replace(/\s+/g, " ")
    .trim()
}

const INFOBOX = /\{\{\s*Infobox[ _]league/i

function infobox(content: string): string | null {
  const start = INFOBOX.exec(content)?.index

  if (start === undefined) return null

  const end = content.indexOf("\n}}", start)

  return end < 0 ? null : content.slice(start, end)
}

function field(box: string, name: string): string | null {
  const match = new RegExp(`\\|${name}=([^\\n]*)`, "i").exec(box)
  const value = match?.[1]?.trim()

  return value === undefined || value.length === 0 ? null : value
}

function number(value: string | null): number | null {
  if (value === null) return null

  const parsed = Number(value.replace(/[^\d.]/g, ""))

  return Number.isFinite(parsed) && parsed > 0 ? parsed : null
}

function section(content: string, titles: readonly string[]): string | null {
  const heading = new RegExp(`^={2,4}\\s*(?:${titles.join("|")})\\s*={2,4}\\s*$`, "im").exec(content)

  if (heading?.index === undefined) return null

  const from = heading.index + heading[0].length
  const next = /^={2,4}[^=]/m.exec(content.slice(from))

  return content.slice(from, next?.index === undefined ? undefined : from + next.index)
}

/** Формат турнира: маркированный список из раздела Format. */
function formatLines(content: string): string[] {
  const body = section(content, ["Format"])

  if (body === null) return []

  const lines: string[] = []

  for (const raw of body.split("\n")) {
    if (!raw.startsWith("*")) continue

    const depth = (/^\*+/.exec(raw)?.[0] ?? "*").length
    const text = plain(raw.replace(/^\*+/, ""))

    if (text.length === 0) continue

    lines.push(depth > 1 ? `— ${text}` : text)

    if (lines.length >= FORMAT_LIMIT) break
  }

  return lines
}

/**
 * Содержимое шаблонов {{Имя|…}} верхнего уровня. Считаем скобки: внутри слота
 * призовых и состава лежат вложенные шаблоны, и простым поиском «}}» не обойтись.
 */
function templates(block: string, name: string): string[] {
  const needle = `{{${name}`
  const found: string[] = []
  let index = block.toLowerCase().indexOf(needle.toLowerCase())

  while (index >= 0) {
    let depth = 0
    let end = -1

    for (let cursor = index; cursor < block.length - 1; cursor += 1) {
      if (block[cursor] === "{" && block[cursor + 1] === "{") {
        depth += 1
        cursor += 1
        continue
      }

      if (block[cursor] === "}" && block[cursor + 1] === "}") {
        depth -= 1
        cursor += 1

        if (depth === 0) {
          end = cursor + 1
          break
        }
      }
    }

    if (end < 0) break

    found.push(block.slice(index + needle.length, end - 2))
    index = block.toLowerCase().indexOf(needle.toLowerCase(), end)
  }

  return found
}

/** Блок шаблона целиком — от «{{Имя» до парной закрывающей скобки. */
function templateBlock(content: string, pattern: RegExp): string | null {
  const start = content.search(pattern)

  if (start < 0) return null

  let depth = 0

  for (let cursor = start; cursor < content.length - 1; cursor += 1) {
    if (content[cursor] === "{" && content[cursor + 1] === "{") {
      depth += 1
      cursor += 1
      continue
    }

    if (content[cursor] === "}" && content[cursor + 1] === "}") {
      depth -= 1
      cursor += 1

      if (depth === 0) return content.slice(start, cursor + 1)
    }
  }

  return null
}

/**
 * Распределение призовых. Мест в шаблоне нет: слоты идут по порядку, а count
 * означает, сколько команд делят эту сумму — отсюда «3—4» и «5—8».
 */
function prizeTable(content: string): EventPrize[] {
  const pool = templateBlock(content, /\{\{(?:Team)?PrizePool/i)

  if (pool === null) return []

  const prizes: EventPrize[] = []
  let position = 1

  for (const slot of templates(pool, "Slot")) {
    const usd = number(/usdprize=([^|\n}]*)/i.exec(slot)?.[1] ?? null)
    const count = Math.max(1, Number(/count=(\d+)/i.exec(slot)?.[1] ?? 1))
    const last = position + count - 1

    prizes.push({ place: count === 1 ? `${position}` : `${position}—${last}`, usd })
    position = last + 1

    if (prizes.length >= PRIZE_LIMIT) break
  }

  return prizes
}

/** Участники с составами: как на HLTV в блоке Teams. */
function participants(content: string): EventParticipant[] {
  const block = templateBlock(content, /\{\{TeamParticipants(?!Controls)/i)

  if (block === null) return []

  const collected: EventParticipant[] = []

  for (const opponent of templates(block, "Opponent")) {
    const team = plain(opponent.split("\n")[0]?.split("|")[0] ?? "")

    if (team.length === 0) continue

    const players: string[] = []
    let coach: string | null = null

    for (const person of templates(opponent, "Person")) {
      const parts = person.split("|").map((part) => part.trim()).filter((part) => part.length > 0)
      const role = parts.find((part) => part.startsWith("role="))?.slice(5)
      const nickname = plain(parts.filter((part) => !part.includes("="))[0] ?? "")

      if (nickname.length === 0) continue
      if (role === "coach") {
        coach = nickname
        continue
      }

      players.push(nickname)
    }

    collected.push({ team, players, coach })

    if (collected.length >= PARTICIPANT_LIMIT) break
  }

  return collected
}

export function parseEventProfile(content: string, page: string): EventProfile {
  const box = infobox(content)

  if (box === null) return EMPTY_EVENT_PROFILE

  const type = field(box, "type")
  const maps: string[] = []

  for (let index = 1; index <= 9; index += 1) {
    const map = field(box, `map${index}`)

    if (map !== null) maps.push(plain(map))
  }

  return {
    page,
    organizer: (() => {
      const raw = field(box, "organizer") ?? field(box, "organizer1")

      return raw === null ? null : plain(raw)
    })(),
    series: (() => {
      const raw = field(box, "series")

      return raw === null ? null : plain(raw)
    })(),
    offline: type === null ? null : /offline|lan/i.test(type),
    prizeUsd: number(field(box, "prizepoolusd") ?? field(box, "prizepool")),
    tier: field(box, "liquipediatier"),
    valveTier: field(box, "publishertier"),
    country: (() => {
      const raw = field(box, "country")

      return raw === null ? null : plain(raw)
    })(),
    city: (() => {
      const raw = field(box, "city")

      return raw === null ? null : plain(raw)
    })(),
    venue: (() => {
      const raw = field(box, "venue")

      return raw === null ? null : plain(raw)
    })(),
    website: field(box, "web"),
    teamCount: number(field(box, "team_number")),
    maps,
    format: formatLines(content),
    prizes: prizeTable(content),
    participants: participants(content),
  }
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

/** Названия страниц-кандидатов. null — сбой запроса, [] — вики ничего не нашла. */
async function searchPages(query: string): Promise<string[] | null> {
  "use cache"

  const url = `${API}?action=query&list=search&srsearch=${encodeURIComponent(query)}&srlimit=5&srnamespace=0&format=json&formatversion=2`
  const body = await wikiJson(url)
  const hits = (body as { query?: { search?: { title?: string }[] } } | null)?.query?.search

  cacheFor("reference", Array.isArray(hits))

  if (!Array.isArray(hits)) return null

  return hits.flatMap((hit) => (typeof hit.title === "string" ? [hit.title] : []))
}

async function loadPage(title: string): Promise<string | null> {
  "use cache"

  const url = `${API}?action=query&prop=revisions&titles=${encodeURIComponent(title.replace(/\s+/g, "_"))}&rvprop=content&rvslots=main&format=json&formatversion=2&redirects=1`
  const body = await wikiJson(url)
  const pages = (body as { query?: { pages?: unknown[] } } | null)?.query?.pages

  cacheFor("reference", Array.isArray(pages))

  if (!Array.isArray(pages)) return null

  const first = pages[0] as { revisions?: { slots?: { main?: { content?: string } } }[] } | undefined
  const content = first?.revisions?.[0]?.slots?.main?.content

  return typeof content === "string" ? content : null
}

/** Ключевые слова названия, по которым проверяем, что нашли именно этот турнир. */
function tokens(value: string): string[] {
  return value
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length >= 3 && !["the", "cs2", "csgo", "counter", "strike"].includes(word))
}

function looksLikeEvent(title: string, content: string, query: string): boolean {
  const needles = tokens(query)

  if (needles.length === 0) return false

  const haystack = `${title} ${content.slice(0, 600)}`.toLowerCase()
  const hits = needles.filter((needle) => haystack.includes(needle)).length

  return hits / needles.length >= 0.6
}

/**
 * Карточка турнира с Liquipedia: организатор, площадка, формат, призовые и
 * пул карт — то, чего нет в матчевом API. Текст под лицензией CC BY-SA 3.0,
 * поэтому страница обязана ссылаться на источник.
 */
export async function getEventProfile(
  tournamentId: string,
  name: string,
): Promise<ApiResult<EventProfile>> {
  "use cache"
  cacheTag(tournamentTag(tournamentId))

  const cleaned = name.replace(/[:#]/g, " ").trim()

  if (cleaned.length === 0) {
    cacheFor("reference", true)

    return ok(EMPTY_EVENT_PROFILE)
  }

  // PandaScore добавляет год к названию серии («…Season 24 2026»), а на вики
  // страница называется без него — ищем оба варианта.
  const withoutYear = cleaned.replace(/\s+(?:19|20)\d{2}$/, "").trim()
  const queries = withoutYear === cleaned ? [cleaned] : [cleaned, withoutYear]
  const found = await Promise.all(queries.map(searchPages))
  const titles = found.some((entry) => entry !== null)
    ? [...new Set(found.flatMap((entry) => entry ?? []))]
    : null
  let healthy = titles !== null

  for (const title of titles ?? []) {
    const content = await loadPage(title)

    healthy = healthy && content !== null

    if (content === null || !INFOBOX.test(content)) continue
    if (!looksLikeEvent(title, content, cleaned)) continue

    cacheFor("reference", healthy)

    return ok(parseEventProfile(content, `${WIKI}/${encodeURIComponent(title.replace(/\s+/g, "_"))}`))
  }

  cacheFor("reference", healthy)

  return ok(EMPTY_EVENT_PROFILE)
}
