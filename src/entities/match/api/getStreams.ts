import { cacheLife, cacheTag } from "next/cache"

import { fail, ok, pandaList } from "@/shared/api"
import type { ApiResult } from "@/shared/api"
import { CS2_MODULE, scheduleTag } from "@/shared/config"

import type { Match, StreamLink } from "../model/match"
import { CS2_PATH } from "./pandaEndpoints"
import { toMatchList } from "./pandaMatchMapper"
import { pandaMatchSchema } from "./pandaMatchSchema"

const SCOPE_SIZE = 40

const PLATFORM_ORDER: Record<string, number> = { youtube: 0, twitch: 1, kick: 2 }

export type StreamEntry = {
  id: string
  stream: StreamLink
  match: Match
  live: boolean
}

export type StreamGroup = {
  key: string
  name: string
  slug: string
  logo: string | null
  live: boolean
  entries: StreamEntry[]
}

export function channelOf(url: string): string {
  try {
    const parsed = new URL(url)
    const segment = parsed.pathname.split("/").filter(Boolean)[0]

    return segment ?? parsed.hostname
  } catch {
    return url
  }
}

function rank(stream: StreamLink): number {
  const platform = PLATFORM_ORDER[stream.platform] ?? 3

  return platform + (stream.official ? 0 : 10)
}

function collect(matches: readonly Match[], live: boolean): StreamEntry[] {
  return matches.flatMap((match) =>
    match.streams
      .filter((stream) => stream.official)
      .map((stream) => ({ id: `${match.id}-${stream.url}`, stream, match, live })),
  )
}

export async function getStreamGroups(): Promise<ApiResult<StreamGroup[]>> {
  "use cache"
  cacheLife("schedule")
  cacheTag(scheduleTag(CS2_MODULE))

  const [running, upcoming] = await Promise.all([
    pandaList(`${CS2_PATH}/matches/running`, pandaMatchSchema, {
      "page[size]": SCOPE_SIZE,
      sort: "begin_at",
    }),
    pandaList(`${CS2_PATH}/matches/upcoming`, pandaMatchSchema, {
      "page[size]": SCOPE_SIZE,
      sort: "begin_at",
    }),
  ])

  if (!running.ok && !upcoming.ok) return fail(running.error)

  const entries = [
    ...collect(running.ok ? toMatchList(running.data) : [], true),
    ...collect(upcoming.ok ? toMatchList(upcoming.data) : [], false),
  ]

  const groups = new Map<string, StreamGroup>()
  const seenChannel = new Set<string>()

  for (const entry of entries) {
    const key = `${entry.match.tournament.id}|${channelOf(entry.stream.url)}|${entry.stream.language}`

    if (seenChannel.has(key)) continue

    seenChannel.add(key)

    const groupKey = entry.match.tournament.id
    const group = groups.get(groupKey)

    if (group === undefined) {
      groups.set(groupKey, {
        key: groupKey,
        name: entry.match.tournament.name,
        slug: entry.match.tournament.slug,
        logo: entry.match.tournament.logo,
        live: entry.live,
        entries: [entry],
      })
      continue
    }

    group.live = group.live || entry.live
    group.entries.push(entry)
  }

  return ok(
    [...groups.values()]
      .map((group) => ({
        ...group,
        entries: group.entries.sort((left, right) => rank(left.stream) - rank(right.stream)),
      }))
      .sort((left, right) => Number(right.live) - Number(left.live)),
  )
}
