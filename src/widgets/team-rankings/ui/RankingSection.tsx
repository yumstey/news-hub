import type { Route } from "next"
import Link from "next/link"

import { getRankingBoard, VALVE_REGION_LABEL, VALVE_REGIONS } from "@/entities/team"
import type { ValveRegion } from "@/entities/team"
import { ROUTES } from "@/shared/config"
import { formatDate } from "@/shared/lib/date"
import { cn } from "@/shared/lib/style"
import { EmptyState } from "@/shared/ui/empty-state"

import { toRankingRowView } from "../model/rankingRow"
import { RankingBoard } from "./RankingBoard"

/** Сколько строк приходит с сервера сразу: дальше подгружает прокрутка. */
const INITIAL_SIZE = 20

function RegionTabs({ active }: { active: ValveRegion }) {
  return (
    <nav aria-label="Регион рейтинга" className="flex flex-wrap gap-1.5">
      {VALVE_REGIONS.map((region) => {
        const selected = region === active
        const href: Route | { pathname: Route; query: { region: string } } =
          region === "global" ? ROUTES.rankings : { pathname: ROUTES.rankings, query: { region } }

        return (
          <Link
            key={region}
            href={href}
            aria-current={selected ? "page" : undefined}
            scroll={false}
            className={cn(
              "inline-flex h-9 items-center rounded-control border px-3.5 text-caption font-semibold transition-colors duration-150",
              selected
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-surface text-muted-foreground hover:border-border-strong hover:text-foreground",
            )}
          >
            {VALVE_REGION_LABEL[region]}
          </Link>
        )
      })}
    </nav>
  )
}

export type RankingSectionProps = {
  region?: ValveRegion
}

/** Рейтинг Valve: вкладки регионов и таблица с подгрузкой по прокрутке. */
export async function RankingSection({ region = "global" }: RankingSectionProps) {
  const result = await getRankingBoard(region, 0, INITIAL_SIZE)

  if (!result.ok) {
    return (
      <div className="flex flex-col gap-4">
        <RegionTabs active={region} />
        <EmptyState
          tone="danger"
          title="Рейтинг сейчас недоступен"
          description="Источник рейтинга Valve временно не отвечает. Попробуйте обновить страницу позже."
        />
      </div>
    )
  }

  const board = result.data

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <RegionTabs active={region} />
        <span className="text-caption text-subtle-foreground">
          {board.updatedAt === null ? null : <>Снимок от {formatDate(board.updatedAt)} · </>}
          {board.total} команд
        </span>
      </div>

      <RankingBoard
        region={region}
        initial={board.rows.map(toRankingRowView)}
        total={board.total}
        loaded={board.rows.length}
      />
    </div>
  )
}

export function RankingSectionSkeleton({ rows = 10 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-1.5">
        {VALVE_REGIONS.map((region) => (
          <span key={region} className="h-9 w-24 rounded-control bg-skeleton" />
        ))}
      </div>
      <div className="flex flex-col gap-px overflow-hidden rounded-surface border border-border bg-surface p-3">
        {Array.from({ length: rows }, (_, index) => (
          <span key={index} className="h-14 w-full rounded-sm bg-skeleton" />
        ))}
      </div>
    </div>
  )
}
