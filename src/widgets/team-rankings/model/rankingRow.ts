import type { RankingEntry } from "@/entities/team"
import { teamHref } from "@/entities/team"
import type { TeamPath } from "@/shared/config"
import type { Country, ImageAsset } from "@/shared/model"

/**
 * Строка рейтинга в виде простых данных: таблица раскрывается на клиенте,
 * а клиентский бандл не должен тянуть серверные функции сущности.
 */
export type RankingRowView = {
  rank: number
  points: number
  change: number | null
  name: string
  roster: string[]
  details: string | null
  href: TeamPath | null
  logo: ImageAsset | null
  darkLogo: ImageAsset | null
  country: Country | null
}

export function toRankingRowView(entry: RankingEntry): RankingRowView {
  return {
    rank: entry.rank,
    points: entry.points,
    change: entry.change,
    name: entry.team?.name ?? entry.name,
    roster: entry.roster,
    details: entry.details,
    href: entry.team === null ? null : teamHref(entry.team.slug),
    logo: entry.team?.logo ?? null,
    darkLogo: entry.team?.darkLogo ?? null,
    country: entry.team?.country ?? null,
  }
}
