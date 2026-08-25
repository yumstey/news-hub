import { dayKey } from "@/shared/lib/date"

import type { Match } from "../model/match"

export type MatchEventGroup = {
  key: string
  name: string
  slug: string
  logo: string | null
  matches: Match[]
}

export type MatchDay = {
  key: string
  date: Date
  events: MatchEventGroup[]
  matches: Match[]
}

export function groupMatchesByEvent(matches: readonly Match[]): MatchEventGroup[] {
  const events = new Map<string, MatchEventGroup>()

  for (const match of matches) {
    const key = match.tournament.id
    const existing = events.get(key)

    if (existing !== undefined) {
      existing.matches.push(match)
      continue
    }

    events.set(key, {
      key,
      name: match.tournament.name,
      slug: match.tournament.slug,
      logo: match.tournament.logo,
      matches: [match],
    })
  }

  return [...events.values()]
}

export function groupMatchesByDay(matches: readonly Match[]): MatchDay[] {
  const days = new Map<string, { date: Date; matches: Match[] }>()

  for (const match of matches) {
    const key = dayKey(match.startsAt)
    const existing = days.get(key)

    if (existing !== undefined) {
      existing.matches.push(match)
      continue
    }

    days.set(key, { date: match.startsAt, matches: [match] })
  }

  return [...days.entries()].map(([key, entry]) => ({
    key,
    date: entry.date,
    matches: entry.matches,
    events: groupMatchesByEvent(entry.matches),
  }))
}
