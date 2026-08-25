import { cacheLife, cacheTag } from "next/cache"

import { fetchText, ok } from "@/shared/api"
import type { ApiResult } from "@/shared/api"
import { teamTag } from "@/shared/config"

const API = "https://liquipedia.net/counterstrike/api.php"

export type TeamPerson = {
  name: string
  countryCode: string | null
}

export type TeamLink = {
  label: string
  url: string
}

export type TeamProfile = {
  page: string | null
  foundedYear: number | null
  region: string | null
  igl: TeamPerson | null
  coaches: TeamPerson[]
  analysts: TeamPerson[]
  manager: TeamPerson | null
  links: TeamLink[]
}

export const EMPTY_PROFILE: TeamProfile = {
  page: null,
  foundedYear: null,
  region: null,
  igl: null,
  coaches: [],
  analysts: [],
  manager: null,
  links: [],
}

const SOCIAL_URL: Record<string, (handle: string) => string> = {
  twitter: (handle) => `https://x.com/${handle}`,
  facebook: (handle) => `https://facebook.com/${handle}`,
  instagram: (handle) => `https://instagram.com/${handle}`,
  youtube: (handle) => `https://youtube.com/${handle}`,
  twitch: (handle) => `https://twitch.tv/${handle}`,
  vk: (handle) => `https://vk.com/${handle}`,
  telegram: (handle) => `https://t.me/${handle}`,
  discord: (handle) => `https://discord.gg/${handle}`,
}

const SOCIAL_LABEL: Record<string, string> = {
  twitter: "X",
  facebook: "Facebook",
  instagram: "Instagram",
  youtube: "YouTube",
  twitch: "Twitch",
  vk: "VK",
  telegram: "Telegram",
  discord: "Discord",
}

function infobox(content: string): string | null {
  const start = content.indexOf("{{Infobox team")

  if (start < 0) return null

  const end = content.indexOf("\n}}", start)

  return end < 0 ? null : content.slice(start, end)
}

function field(box: string, name: string): string | null {
  const match = new RegExp(`\\|${name}=([^\\n]*)`, "i").exec(box)

  return match?.[1] === undefined ? null : match[1].trim()
}

function people(raw: string | null): TeamPerson[] {
  if (raw === null || raw.length === 0) return []

  return raw
    .split(/<br\s*\/?>/i)
    .map((entry) => {
      const flag = /\{\{flag\|([a-z]{2})\}\}/i.exec(entry)
      const name = entry
        .replace(/\{\{[^}]*\}\}/g, "")
        .replace(/\[\[(?:[^|\]]*\|)?([^\]]*)\]\]/g, "$1")
        .replace(/'''/g, "")
        .trim()

      return { name, countryCode: flag?.[1]?.toUpperCase() ?? null }
    })
    .filter((person) => person.name.length > 0)
}

function links(box: string): TeamLink[] {
  const collected: TeamLink[] = []
  const website = field(box, "website")

  if (website !== null && /^https?:\/\//.test(website)) {
    collected.push({ label: "Официальный сайт", url: website })
  }

  for (const [key, build] of Object.entries(SOCIAL_URL)) {
    const handle = field(box, key)

    if (
      handle === null ||
      handle.length === 0 ||
      handle.includes("{{") ||
      handle.includes("<!--") ||
      handle.includes("<")
    ) {
      continue
    }

    collected.push({
      label: SOCIAL_LABEL[key] ?? key,
      url: /^https?:\/\//.test(handle) ? handle : build(handle),
    })
  }

  return collected
}

function foundedYear(box: string): number | null {
  const raw = field(box, "created")

  if (raw === null) return null

  const match = /(\d{4})/.exec(raw)

  return match?.[1] === undefined ? null : Number(match[1])
}

export function parseTeamProfile(content: string, page: string): TeamProfile {
  const box = infobox(content)

  if (box === null) return EMPTY_PROFILE

  const coaches = people(field(box, "coaches") ?? field(box, "coach"))

  return {
    page,
    foundedYear: foundedYear(box),
    region: field(box, "region"),
    igl: people(field(box, "igl"))[0] ?? null,
    coaches,
    analysts: people(field(box, "analysts") ?? field(box, "analyst")),
    manager: people(field(box, "manager"))[0] ?? null,
    links: links(box),
  }
}

async function resolveTitle(teamName: string): Promise<string | null> {
  const url = `${API}?action=opensearch&search=${encodeURIComponent(teamName)}&limit=5&namespace=0&format=json`
  const result = await fetchText(url)

  if (!result.ok) return null

  try {
    const body: unknown = JSON.parse(result.data)

    if (!Array.isArray(body) || !Array.isArray(body[1])) return null

    const titles = body[1].filter(
      (entry): entry is string => typeof entry === "string" && !entry.includes("/"),
    )

    return titles[0] ?? null
  } catch {
    return null
  }
}

async function loadContent(title: string): Promise<{ content: string; title: string } | null> {
  const url = `${API}?action=query&prop=revisions&titles=${encodeURIComponent(title.replace(/\s+/g, "_"))}&rvprop=content&rvslots=main&format=json&formatversion=2&redirects=1`
  const result = await fetchText(url)

  if (!result.ok) return null

  try {
    const body: unknown = JSON.parse(result.data)
    const pages = (body as { query?: { pages?: unknown[] } }).query?.pages

    if (!Array.isArray(pages) || pages.length === 0) return null

    const first = pages[0] as {
      title?: string
      missing?: boolean
      revisions?: { slots?: { main?: { content?: string } } }[]
    }

    if (first.missing === true) return null

    const content = first.revisions?.[0]?.slots?.main?.content

    if (typeof content !== "string") return null

    return { content, title: first.title ?? title }
  } catch {
    return null
  }
}

export async function getTeamProfile(teamName: string): Promise<ApiResult<TeamProfile>> {
  "use cache"
  cacheLife("reference")
  cacheTag(teamTag(teamName))

  const candidates = [teamName, `Team ${teamName}`]
  const resolved = await resolveTitle(teamName)

  if (resolved !== null) candidates.unshift(resolved)

  for (const candidate of candidates) {
    const page = await loadContent(candidate)

    if (page === null) continue
    if (!page.content.includes("{{Infobox team")) continue

    return ok(
      parseTeamProfile(
        page.content,
        `https://liquipedia.net/counterstrike/${encodeURIComponent(page.title.replace(/\s+/g, "_"))}`,
      ),
    )
  }

  return ok(EMPTY_PROFILE)
}
