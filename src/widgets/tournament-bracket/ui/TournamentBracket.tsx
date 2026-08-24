import Image from "next/image"
import Link from "next/link"

import { buildBracket, matchHref } from "@/entities/match"
import type { BracketRound, BracketSlot, Match, MatchSide } from "@/entities/match"
import { cn } from "@/shared/lib/style"
import { EmptyState } from "@/shared/ui/empty-state"
import { SectionHeading } from "@/shared/ui/section-heading"

const rowsClass: Record<number, string> = {
  1: "grid-rows-1",
  2: "grid-rows-2",
  4: "grid-rows-4",
  8: "grid-rows-8",
}

const minHeightClass: Record<number, string> = {
  1: "min-h-24",
  2: "min-h-48",
  4: "min-h-96",
  8: "min-h-[48rem]",
}

function SideRow({ side, live }: { side: MatchSide; live: boolean }) {
  return (
    <span className="flex items-center gap-2 px-2.5 py-1.5">
      <span
        aria-hidden="true"
        className={cn(
          "h-6 w-0.5 shrink-0 rounded-full",
          side.isWinner ? "bg-success" : live ? "bg-live" : "bg-transparent",
        )}
      />
      <Image
        src={side.team.logo.url}
        alt=""
        width={18}
        height={18}
        className="size-4.5 shrink-0 rounded-xs object-contain"
      />
      <span
        className={cn(
          "min-w-0 flex-1 truncate text-caption",
          side.isWinner ? "font-semibold text-foreground" : "text-muted-foreground",
        )}
      >
        {side.team.shortName}
      </span>
      <span
        className={cn(
          "shrink-0 text-caption font-bold tabular-nums",
          live ? "text-live" : side.isWinner ? "text-foreground" : "text-subtle-foreground",
        )}
      >
        {side.score}
      </span>
    </span>
  )
}

function MatchSlot({ match }: { match: Match }) {
  const live = match.status === "live"
  const [first, second] = match.teams

  return (
    <Link
      href={matchHref(match.discipline.slug, match.id)}
      className={cn(
        "flex w-full flex-col divide-y divide-border overflow-hidden rounded-control border bg-surface transition-colors duration-150 hover:border-primary",
        live ? "border-live/50" : "border-border",
      )}
    >
      <SideRow side={first} live={live} />
      <SideRow side={second} live={live} />
    </Link>
  )
}

function PendingSlot() {
  return (
    <div className="flex w-full flex-col divide-y divide-border overflow-hidden rounded-control border border-dashed border-border bg-muted/50">
      {[0, 1].map((row) => (
        <span key={row} className="flex items-center gap-2 px-2.5 py-1.5">
          <span aria-hidden="true" className="size-4.5 shrink-0 rounded-xs bg-border" />
          <span className="flex-1 text-caption text-subtle-foreground">Не определён</span>
        </span>
      ))}
    </div>
  )
}

function Connector({ pairs }: { pairs: number }) {
  const groups = Array.from({ length: pairs }, (_, index) => index)

  return (
    <div aria-hidden="true" className="hidden shrink-0 flex-col gap-3 md:flex">
      <span className="invisible text-overline uppercase tracking-wider">.</span>
      <div className={cn("grid flex-1", rowsClass[pairs] ?? "grid-rows-1")}>
        {groups.map((group) => (
        <div key={group} className="flex">
          <div className="grid w-4 grid-rows-[1fr_2fr_1fr]">
            <div />
            <div className="border-y border-r border-border" />
            <div />
          </div>
          <div className="grid w-4 grid-rows-2">
            <div className="border-b border-border" />
            <div />
          </div>
        </div>
        ))}
      </div>
    </div>
  )
}

function Round({ round, size }: { round: BracketRound; size: number }) {
  return (
    <div className="flex min-w-40 shrink-0 flex-col gap-3">
      <h3 className="text-overline uppercase tracking-wider text-subtle-foreground">
        {round.title}
      </h3>
      <div className={cn("grid flex-1", rowsClass[size] ?? "grid-rows-1")}>
        {round.slots.map((slot: BracketSlot, index) => (
          <div
            key={slot.kind === "match" ? slot.match.id : `pending-${index}`}
            className="flex items-center py-1.5"
          >
            {slot.kind === "match" ? <MatchSlot match={slot.match} /> : <PendingSlot />}
          </div>
        ))}
      </div>
    </div>
  )
}

export type TournamentBracketProps = {
  matches: readonly Match[]
  title?: string
  className?: string
}

export function TournamentBracket({
  matches,
  title = "Сетка плей-офф",
  className,
}: TournamentBracketProps) {
  const rounds = buildBracket(matches)

  if (rounds.length === 0) {
    return (
      <EmptyState
        title="Сетка ещё не сформирована"
        description="Плей-офф начнётся после группового этапа."
        className={className}
      />
    )
  }

  const firstRoundSize = rounds[0]?.slots.length ?? 1

  return (
    <section className={cn("flex flex-col gap-4", className)}>
      <SectionHeading title={title} />

      <div className="overflow-x-auto rounded-surface border border-border bg-elevated p-4">
        <div className={cn("flex items-stretch", minHeightClass[firstRoundSize] ?? "min-h-48")}>
          {rounds.map((round, index) => {
            const size = round.slots.length

            return (
              <div key={round.round} className="flex items-stretch">
                <Round round={round} size={size} />
                {index < rounds.length - 1 ? <Connector pairs={Math.max(1, size / 2)} /> : null}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
