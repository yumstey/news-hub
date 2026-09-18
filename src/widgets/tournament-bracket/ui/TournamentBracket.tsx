import { matchHref } from "@/entities/match"
import { TOURNAMENT_STATUS_LABEL } from "@/entities/tournament"
import type { TournamentBracket as Bracket } from "@/entities/tournament"
import { cn } from "@/shared/lib/style"
import { SectionHeading } from "@/shared/ui/section-heading"

import { layoutBracket } from "../lib/layoutBracket"
import { BracketCanvas } from "./BracketCanvas"

function LegendLine({ dashed }: { dashed?: boolean }) {
  return (
    <svg aria-hidden="true" width="22" height="8" viewBox="0 0 22 8" className="shrink-0">
      <path
        d="M 0 4 H 22"
        fill="none"
        strokeWidth="1.5"
        strokeDasharray={dashed === true ? "5 4" : undefined}
        className="stroke-border-strong"
      />
    </svg>
  )
}

export function TournamentBracket({ bracket }: { bracket: Bracket }) {
  if (bracket.matches.length === 0) return null

  const layout = layoutBracket(bracket, matchHref)
  const hasLower = bracket.sides.includes("lower")

  return (
    <section className="flex flex-col gap-4">
      <SectionHeading
        title={bracket.stageName}
        action={
          <span
            className={cn(
              "inline-flex h-6 items-center rounded-xs px-2 text-overline font-bold uppercase",
              bracket.stageStatus === "ongoing"
                ? "bg-live-soft text-live"
                : bracket.stageStatus === "upcoming"
                  ? "bg-primary-soft text-primary"
                  : "bg-muted text-subtle-foreground",
            )}
          >
            {TOURNAMENT_STATUS_LABEL[bracket.stageStatus]}
          </span>
        }
      />

      <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-caption text-subtle-foreground">
        <span className="flex items-center gap-2">
          <LegendLine />
          Победитель идёт дальше
        </span>
        {hasLower ? (
          <span className="flex items-center gap-2">
            <LegendLine dashed />
            Проигравший падает в нижнюю сетку
          </span>
        ) : null}
        <span className="hidden lg:inline">Наведите на команду — подсветится её путь</span>
      </div>

      <BracketCanvas layout={layout} />
    </section>
  )
}

export function TournamentBracketSkeleton() {
  return <div className="h-72 rounded-surface border border-border bg-skeleton" />
}
