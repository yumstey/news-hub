import { cacheTag } from "next/cache"

import { CS2_MODULE, scheduleTag } from "@/shared/config"
import { cacheFor } from "@/shared/lib/cache"
import { dayKey } from "@/shared/lib/date"

import { getLiveCount } from "./getLiveCount"
import { getUpcomingMatches } from "./getUpcomingMatches"

const POOL = 100

export type ScheduleSummary = {
  live: number
  /** Матчей сегодня по московскому дню — тому же, по которому группируется расписание. */
  today: number
  events: number
}

/**
 * Счётчики для баннера раздела. Текущая дата берётся внутри кэша: снаружи
 * (при пререндере) читать часы нельзя, а профиль расписания живёт минуты.
 */
export async function getScheduleSummary(): Promise<ScheduleSummary> {
  "use cache"
  cacheTag(scheduleTag(CS2_MODULE))

  const [live, upcoming] = await Promise.all([getLiveCount(), getUpcomingMatches(POOL)])

  cacheFor("schedule", upcoming.ok)

  const today = dayKey(new Date())
  const matches = (upcoming.ok ? upcoming.data : []).filter(
    (match) => dayKey(match.startsAt) === today,
  )

  return {
    live,
    today: matches.length,
    events: new Set(matches.map((match) => match.tournament.id)).size,
  }
}
