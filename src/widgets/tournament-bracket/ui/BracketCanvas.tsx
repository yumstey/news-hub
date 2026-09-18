"use client"

import Link from "next/link"
import { useState } from "react"

import type { BracketSeat } from "@/entities/tournament"
import { formatDayMonth, formatTime, toIsoDate } from "@/shared/lib/date"
import { cn } from "@/shared/lib/style"
import { Logo } from "@/shared/ui/logo"

import { CARD_HEIGHT, CARD_WIDTH } from "../lib/layoutBracket"
import type { BracketLayout, BracketNode } from "../lib/layoutBracket"

type TeamId = BracketNode["teamIds"][number]

type SeatRowProps = {
  seat: BracketSeat
  decided: boolean
  active: boolean
  onHover: (teamId: TeamId | null) => void
}

function SeatRow({ seat, decided, active, onHover }: SeatRowProps) {
  const lost = decided && seat.team !== null && !seat.isWinner

  return (
    <span
      onPointerEnter={() => onHover(seat.team?.id ?? null)}
      className={cn(
        "flex flex-1 items-center gap-2 px-2.5",
        seat.isWinner ? "bg-success-soft/50" : undefined,
        active ? "bg-primary-soft" : undefined,
      )}
    >
      {seat.team === null ? (
        <>
          <span
            aria-hidden="true"
            className="size-5 shrink-0 rounded-xs border border-dashed border-border-strong"
          />
          <span className="truncate text-caption text-subtle-foreground">TBD</span>
        </>
      ) : (
        <>
          <Logo
            logo={seat.team.logo}
            darkLogo={seat.team.darkLogo}
            size={20}
            className="size-5"
          />
          <span
            className={cn(
              "min-w-0 flex-1 truncate text-caption",
              seat.isWinner
                ? "font-semibold text-foreground"
                : lost
                  ? "text-subtle-foreground"
                  : "text-muted-foreground",
            )}
          >
            {seat.team.name}
          </span>
        </>
      )}

      {decided ? (
        <span
          className={cn(
            "shrink-0 text-caption font-bold tabular-nums",
            seat.isWinner ? "text-success" : "text-danger",
          )}
        >
          {seat.score}
        </span>
      ) : null}
    </span>
  )
}

type CardProps = {
  node: BracketNode
  activeTeam: TeamId | null
  onHover: (teamId: TeamId | null) => void
}

function MatchCard({ node, activeTeam, onHover }: CardProps) {
  const { match } = node
  const decided = match.status === "finished"
  const [first, second] = match.seats
  const involved = activeTeam !== null && node.teamIds.includes(activeTeam)

  return (
    <Link
      href={node.href}
      className={cn(
        "flex size-full flex-col overflow-hidden rounded-control border bg-surface",
        "transition-[border-color,box-shadow,opacity,transform] duration-200",
        "hover:-translate-y-px hover:shadow-surface",
        match.status === "live" ? "border-live/50" : "border-border",
        involved ? "border-primary shadow-surface" : undefined,
        activeTeam !== null && !involved ? "opacity-40" : undefined,
      )}
    >
      <span className="flex h-[22px] shrink-0 items-center justify-between gap-2 border-b border-border bg-elevated px-2.5">
        {match.startsAt === null ? (
          <span className="text-overline text-subtle-foreground">—</span>
        ) : (
          <time
            dateTime={toIsoDate(match.startsAt)}
            className="text-overline tabular-nums text-muted-foreground"
          >
            {formatTime(match.startsAt)} · {formatDayMonth(match.startsAt)}
          </time>
        )}
        <span className="text-overline font-bold uppercase text-subtle-foreground">
          {match.format}
        </span>
      </span>

      <SeatRow
        seat={first}
        decided={decided}
        active={activeTeam !== null && first.team?.id === activeTeam}
        onHover={onHover}
      />
      <span aria-hidden="true" className="h-px shrink-0 bg-border" />
      <SeatRow
        seat={second}
        decided={decided}
        active={activeTeam !== null && second.team?.id === activeTeam}
        onHover={onHover}
      />
    </Link>
  )
}

export function BracketCanvas({ layout }: { layout: BracketLayout }) {
  const [activeTeam, setActiveTeam] = useState<TeamId | null>(null)

  return (
    <div
      className="-mx-gutter overflow-x-auto px-gutter pb-3 lg:mx-0 lg:px-0"
      onPointerLeave={() => setActiveTeam(null)}
    >
      <div
        className="relative"
        style={{ width: `${layout.width}px`, height: `${layout.height}px` }}
      >
        <svg
          aria-hidden="true"
          width={layout.width}
          height={layout.height}
          viewBox={`0 0 ${layout.width} ${layout.height}`}
          className="pointer-events-none absolute inset-0 overflow-visible"
        >
          {layout.edges.map((edge) => {
            const lit = activeTeam !== null && edge.teamId === activeTeam

            return (
              <path
                key={edge.id}
                d={edge.path}
                fill="none"
                strokeWidth={lit ? 2 : 1.5}
                strokeDasharray={edge.kind === "loser" ? "5 4" : undefined}
                className={cn(
                  "transition-[stroke,opacity] duration-200",
                  lit ? "stroke-primary" : "stroke-border-strong",
                  activeTeam !== null && !lit ? "opacity-30" : undefined,
                  edge.kind === "loser" && !lit ? "opacity-60" : undefined,
                )}
              />
            )
          })}
        </svg>

        {layout.sides.map((label) => (
          <div
            key={label.key}
            className="absolute flex items-center gap-3"
            style={{ left: 0, top: `${label.y}px`, width: `${layout.width}px` }}
          >
            <span className="text-caption font-bold uppercase tracking-wider text-foreground">
              {label.text}
            </span>
            <span aria-hidden="true" className="h-px flex-1 bg-border" />
          </div>
        ))}

        {layout.rounds.map((label) => (
          <div
            key={label.key}
            className="absolute truncate text-overline uppercase tracking-wider text-muted-foreground"
            style={{ left: `${label.x}px`, top: `${label.y}px`, width: `${CARD_WIDTH}px` }}
          >
            {label.text}
          </div>
        ))}

        {layout.nodes.map((node) => (
          <div
            key={node.match.id}
            className="absolute"
            style={{
              left: `${node.x}px`,
              top: `${node.y}px`,
              width: `${CARD_WIDTH}px`,
              height: `${CARD_HEIGHT}px`,
            }}
          >
            <MatchCard node={node} activeTeam={activeTeam} onHover={setActiveTeam} />
          </div>
        ))}
      </div>
    </div>
  )
}
