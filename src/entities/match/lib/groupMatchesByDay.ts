import { dayKey } from "@/shared/lib/date"

import type { Match } from "../model/match"

export type MatchDay = {
  key: string
  date: Date
  matches: Match[]
}

export function groupMatchesByDay(matches: readonly Match[]): MatchDay[] {
  const days = new Map<string, MatchDay>()

  for (const match of matches) {
    const key = dayKey(match.startsAt)
    const existing = days.get(key)

    if (existing) {
      existing.matches.push(match)
      continue
    }

    days.set(key, { key, date: match.startsAt, matches: [match] })
  }

  return [...days.values()]
}
