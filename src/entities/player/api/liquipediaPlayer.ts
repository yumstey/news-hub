import { cacheTag } from "next/cache"

import { fetchText, ok } from "@/shared/api"
import type { ApiResult } from "@/shared/api"
import { playerTag } from "@/shared/config"
import { cacheFor } from "@/shared/lib/cache"

const API = "https://liquipedia.net/counterstrike/api.php"
const WIKI = "https://liquipedia.net/counterstrike"

const AWARD_LIMIT = 24
const MVP_LIMIT = 40

export type PlayerLink = {
  label: string
  url: string
}

/** Отрезок карьеры: команда и период, как их ведёт Liquipedia. */
export type PlayerSpell = {
  team: string
  period: string
  note: string | null
}

export type PlayerAward = {
  text: string
  year: number | null
}

/** Место в годовом рейтинге игроков (HLTV Top 20 и аналоги). */
export type PlayerRanking = {
  year: number
  place: number
  source: string
}

export type PlayerMvp = {
  event: string
  /** Крупный турнир — Liquipedia выделяет такие жирным. */
  big: boolean
  major: boolean
}

export type PlayerProfile = {
  page: string | null
  realName: string | null
  birthDate: Date | null
  status: string | null
  yearsActive: string | null
  roles: string[]
  nicknames: string[]
  spells: PlayerSpell[]
  rankings: PlayerRanking[]
  awards: PlayerAward[]
  mvps: PlayerMvp[]
  links: PlayerLink[]
}

export const EMPTY_PLAYER_PROFILE: PlayerProfile = {
  page: null,
  realName: null,
  birthDate: null,
  status: null,
  yearsActive: null,
  roles: [],
  nicknames: [],
  spells: [],
  rankings: [],
  awards: [],
  mvps: [],
  links: [],
}

const SOCIAL_URL: Record<string, (handle: string) => string> = {
  twitter: (handle) => `https://x.com/${handle}`,
  instagram: (handle) => `https://instagram.com/${handle}`,
  youtube: (handle) => `https://youtube.com/${handle}`,
  twitch: (handle) => `https://twitch.tv/${handle}`,
  facebook: (handle) => `https://facebook.com/${handle}`,
  telegram: (handle) => `https://t.me/${handle}`,
  hltv: (handle) => `https://www.hltv.org/player/${handle}/-`,
  esea: (handle) => `https://play.esea.net/users/${handle}`,
  steam64ID: (handle) => `https://steamcommunity.com/profiles/${handle}`,
}

const SOCIAL_LABEL: Record<string, string> = {
  twitter: "X",
  instagram: "Instagram",
  youtube: "YouTube",
  twitch: "Twitch",
  facebook: "Facebook",
  telegram: "Telegram",
  hltv: "HLTV",
  esea: "ESEA",
  steam64ID: "Steam",
}

const ROLE_LABEL: Record<string, string> = {
  awp: "AWP",
  rifle: "Rifler",
  igl: "IGL",
  entry: "Entry",
  support: "Support",
  lurker: "Lurker",
  coach: "Тренер",
  analyst: "Аналитик",
}

/** Снимает вики-разметку: ссылки, шаблоны, сноски, жирный текст. */
function plain(raw: string): string {
  return raw
    .replace(/<ref[^>]*\/>/gi, "")
    .replace(/<ref[^>]*>[\s\S]*?<\/ref>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/\[\[(?:[^|\]]*\|)?([^\]]*)\]\]/g, "$1")
    .replace(/\{\{[^{}]*\}\}/g, "")
    .replace(/'''?/g, "")
    .replace(/<\/?[a-z][^>]*>/gi, "")
    .replace(/\s+/g, " ")
    .trim()
}

/** Liquipedia пишет имя шаблона по-разному: Infobox player и Infobox Player. */
const INFOBOX = /\{\{\s*Infobox[ _]player/i

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

function section(content: string, titles: string[]): string | null {
  const heading = new RegExp(`^={2,3}\\s*(?:${titles.join("|")})\\s*={2,3}\\s*$`, "im").exec(
    content,
  )

  if (heading?.index === undefined) return null

  const from = heading.index + heading[0].length
  const next = /^={2,3}[^=]/m.exec(content.slice(from))

  return content.slice(from, next?.index === undefined ? undefined : from + next.index)
}

function links(box: string): PlayerLink[] {
  const collected: PlayerLink[] = []

  for (const [key, build] of Object.entries(SOCIAL_URL)) {
    const handle = field(box, key)

    if (handle === null || handle.includes("{{") || handle.includes("<")) continue

    collected.push({
      label: SOCIAL_LABEL[key] ?? key,
      url: /^https?:\/\//.test(handle) ? handle : build(handle),
    })
  }

  return collected
}

function spells(box: string): PlayerSpell[] {
  const collected: PlayerSpell[] = []
  const pattern = /\{\{TH\|([^|}]*)\|([^|}]*)((?:\|[^|}]*)*)\}\}/g

  for (const match of box.matchAll(pattern)) {
    const period = plain(match[1] ?? "").replace(/Present/i, "наст. время")
    const team = plain(match[2] ?? "")

    if (team.length === 0) continue

    const extras = (match[3] ?? "")
      .split("|")
      .map((part) => plain(part))
      .filter((part) => part.length > 0 && !part.toLowerCase().startsWith("link="))

    collected.push({ team, period, note: extras[0] ?? null })
  }

  return collected.reverse()
}

const RANKING_LINE =
  /^Was ranked the (best|\d+(?:st|nd|rd|th)) (?:best )?player of ((?:19|20)\d{2}) by (.+?)\.?$/i

function awards(content: string): { awards: PlayerAward[]; rankings: PlayerRanking[] } {
  const body = section(content, ["Awards", "Awards and achievements"])

  if (body === null) return { awards: [], rankings: [] }

  const collected: PlayerAward[] = []
  const rankings: PlayerRanking[] = []

  for (const line of body.split("\n")) {
    if (!line.startsWith("*") || line.startsWith("**")) continue

    const text = plain(line.replace(/^\*+/, ""))

    if (text.length === 0) continue

    const ranked = RANKING_LINE.exec(text)

    if (ranked?.[1] !== undefined && ranked[2] !== undefined && ranked[3] !== undefined) {
      const place = ranked[1].toLowerCase() === "best" ? 1 : Number.parseInt(ranked[1], 10)

      if (Number.isInteger(place)) {
        rankings.push({ year: Number(ranked[2]), place, source: ranked[3].trim() })
        continue
      }
    }

    const year = /\b(?:19|20)\d{2}\b/.exec(text)

    collected.push({ text, year: year === null ? null : Number(year[0]) })

    if (collected.length >= AWARD_LIMIT) break
  }

  return {
    awards: collected,
    rankings: rankings.sort((left, right) => right.year - left.year || left.place - right.place),
  }
}

function mvps(content: string): PlayerMvp[] {
  const body = section(content, ["MVP Awards", "MVPs", "MVP"])

  if (body === null) return []

  const collected: PlayerMvp[] = []

  for (const line of body.split("\n")) {
    if (!line.startsWith("**")) continue

    const raw = line.replace(/^\*+/, "")
    const event = plain(raw)

    if (event.length === 0) continue

    collected.push({
      event,
      big: raw.includes("'''"),
      major: /<u>/i.test(raw),
    })

    if (collected.length >= MVP_LIMIT) break
  }

  return collected
}

function roles(box: string): string[] {
  const raw = field(box, "roles") ?? field(box, "role")

  if (raw === null) return []

  return raw
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter((entry) => entry.length > 0)
    .map((entry) => ROLE_LABEL[entry] ?? entry)
}

function list(box: string, name: string): string[] {
  const raw = field(box, name)

  if (raw === null) return []

  return plain(raw)
    .split(",")
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0)
}

export function parsePlayerProfile(content: string, page: string): PlayerProfile {
  const box = infobox(content)

  if (box === null) return EMPTY_PLAYER_PROFILE

  const birth = field(box, "birth_date")
  const birthTime = birth === null ? Number.NaN : Date.parse(birth)
  const realName = field(box, "romanized_name") ?? field(box, "name")
  const honours = awards(content)

  return {
    page,
    realName: realName === null ? null : plain(realName),
    birthDate: Number.isFinite(birthTime) ? new Date(birthTime) : null,
    status: field(box, "status"),
    yearsActive: (() => {
      const raw = field(box, "years_active")

      return raw === null ? null : plain(raw).replace(/Present/i, "наст. время")
    })(),
    roles: roles(box),
    nicknames: list(box, "nicknames"),
    spells: spells(box),
    rankings: honours.rankings,
    awards: honours.awards,
    mvps: mvps(content),
    links: links(box),
  }
}

/** Страница вики: "missing" — такой страницы нет, null — сбой запроса. */
async function loadPage(title: string): Promise<{ content: string; title: string } | "missing" | null> {
  const url = `${API}?action=query&prop=revisions&titles=${encodeURIComponent(title.replace(/\s+/g, "_"))}&rvprop=content&rvslots=main&format=json&formatversion=2&redirects=1`
  const result = await fetchText(url)

  if (!result.ok) return null

  try {
    const body: unknown = JSON.parse(result.data)
    const pages = (body as { query?: { pages?: unknown[] } }).query?.pages

    if (!Array.isArray(pages)) return null
    if (pages.length === 0) return "missing"

    const first = pages[0] as {
      title?: string
      missing?: boolean
      revisions?: { slots?: { main?: { content?: string } } }[]
    }

    if (first.missing === true) return "missing"

    const content = first.revisions?.[0]?.slots?.main?.content

    if (typeof content !== "string") return "missing"

    return { content, title: first.title ?? title }
  } catch {
    return null
  }
}

/**
 * Профиль игрока с Liquipedia: команда за командой, награды и MVP-медали —
 * то, чего нет в матчевом API.
 */
export async function getPlayerProfile(
  nickname: string,
  realName: string | null,
): Promise<ApiResult<PlayerProfile>> {
  "use cache"
  cacheTag(playerTag(nickname))

  const candidates = [nickname, ...(realName === null ? [] : [realName])]
  let healthy = true

  for (const candidate of candidates) {
    const page = await loadPage(candidate)

    if (page === null) healthy = false
    if (page === null || page === "missing") continue
    if (!INFOBOX.test(page.content)) continue

    cacheFor("reference", true)

    return ok(
      parsePlayerProfile(
        page.content,
        `${WIKI}/${encodeURIComponent(page.title.replace(/\s+/g, "_"))}`,
      ),
    )
  }

  cacheFor("reference", healthy)

  return ok(EMPTY_PLAYER_PROFILE)
}
