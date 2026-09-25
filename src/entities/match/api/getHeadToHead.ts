import { cacheTag } from "next/cache"

import { ok, pandaList } from "@/shared/api"
import type { ApiResult } from "@/shared/api"
import { teamTag } from "@/shared/config"
import { cacheFor } from "@/shared/lib/cache"

import type { Match } from "../model/match"
import { pageSizeWithSlack } from "./pandaEndpoints"
import { toMatchList } from "./pandaMatchMapper"
import { pandaMatchSchema } from "./pandaMatchSchema"

/** Сколько последних матчей команды просматриваем в поисках очных встреч. */
const POOL = 100
const RECENT = 5

export type HeadToHead = {
  played: number
  firstWins: number
  secondWins: number
  firstMapWins: number
  secondMapWins: number
  /** Последние очные матчи, свежие первыми. */
  recent: Match[]
}

export const EMPTY_HEAD_TO_HEAD: HeadToHead = {
  played: 0,
  firstWins: 0,
  secondWins: 0,
  firstMapWins: 0,
  secondMapWins: 0,
  recent: [],
}

/**
 * Личные встречи двух команд. PandaScore не отдаёт очную статистику отдельным
 * запросом, поэтому считаем её по последним матчам первой команды.
 */
export async function getHeadToHead(
  firstSlug: string,
  firstId: string,
  secondId: string,
): Promise<ApiResult<HeadToHead>> {
  "use cache"
  cacheTag(teamTag(firstSlug))

  const result = await pandaList(
    `/teams/${encodeURIComponent(firstSlug)}/matches`,
    pandaMatchSchema,
    {
      "page[size]": pageSizeWithSlack(POOL),
      "filter[status]": "finished",
      sort: "-scheduled_at",
    },
  )

  cacheFor("reference", result.ok)

  if (!result.ok) return ok(EMPTY_HEAD_TO_HEAD)

  const meetings = toMatchList(result.data, "desc").filter((match) =>
    match.teams.some((side) => side.team.id === secondId),
  )

  const summary = meetings.reduce<HeadToHead>(
    (total, match) => {
      const first = match.teams.find((side) => side.team.id === firstId)
      const second = match.teams.find((side) => side.team.id === secondId)

      if (first === undefined || second === undefined) return total

      return {
        played: total.played + 1,
        firstWins: total.firstWins + (first.isWinner ? 1 : 0),
        secondWins: total.secondWins + (second.isWinner ? 1 : 0),
        firstMapWins: total.firstMapWins + first.score,
        secondMapWins: total.secondMapWins + second.score,
        recent: total.recent,
      }
    },
    { ...EMPTY_HEAD_TO_HEAD },
  )

  return ok({ ...summary, recent: meetings.slice(0, RECENT) })
}
