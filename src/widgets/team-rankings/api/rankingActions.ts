"use server"

import { getRankDetails, getRankingBoard, RANKING_PAGE_SIZE } from "@/entities/team"
import type { ValveRankDetails, ValveRegion } from "@/entities/team"

import { toRankingRowView } from "../model/rankingRow"
import type { RankingRowView } from "../model/rankingRow"

/** Следующая страница рейтинга для бесконечной прокрутки. */
export async function loadRankingPage(
  region: ValveRegion,
  offset: number,
): Promise<RankingRowView[]> {
  const result = await getRankingBoard(region, offset, RANKING_PAGE_SIZE)

  return result.ok ? result.data.rows.map(toRankingRowView) : []
}

/** Разбор очков команды — подгружается при раскрытии строки. */
export async function loadRankDetails(
  region: ValveRegion,
  details: string,
): Promise<ValveRankDetails | null> {
  const result = await getRankDetails(region, details)

  return result.ok ? result.data : null
}
