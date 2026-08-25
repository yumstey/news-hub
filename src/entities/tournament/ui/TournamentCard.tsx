import { CalendarDays, ChevronRight, MapPin, Trophy, Users } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

import { formatDate, toIsoDate } from "@/shared/lib/date"
import { cn } from "@/shared/lib/style"
import { CountryTag } from "@/shared/ui/country-tag"

import { formatPrize } from "../lib/formatPrize"
import { tournamentHref } from "../lib/tournamentHref"
import { TOURNAMENT_STATUS_LABEL } from "../model/tournament"
import type { Tournament } from "../model/tournament"
import { TournamentTierBadge } from "./TournamentTierBadge"

const statusTone: Record<Tournament["status"], string> = {
  ongoing: "bg-live-soft text-live",
  upcoming: "bg-primary-soft text-primary",
  finished: "bg-muted text-subtle-foreground",
}

function Row({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <span className="flex items-center justify-between gap-3">
      <span className="flex items-center gap-2 text-caption text-subtle-foreground">
        <span aria-hidden="true" className="text-border-strong">
          {icon}
        </span>
        {label}
      </span>
      <span className="flex items-center gap-1.5 text-caption font-semibold text-foreground">
        {children}
      </span>
    </span>
  )
}

export function TournamentCard({ tournament }: { tournament: Tournament }) {
  const logo = tournament.ref.logo

  return (
    <Link
      href={tournamentHref(tournament.slug)}
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-surface border border-border bg-surface",
        "animate-rise-in",
        "transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-surface active:translate-y-0",
      )}
    >
      <span className="relative flex items-center gap-3 overflow-hidden border-b border-border bg-linear-to-br from-primary-soft via-elevated to-elevated px-4 py-3">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -right-8 -top-10 size-24 rounded-full bg-primary/15 blur-2xl transition-opacity duration-300 group-hover:opacity-70"
        />

        {logo === null ? (
          <span
            aria-hidden="true"
            className="relative flex size-10 shrink-0 items-center justify-center rounded-control bg-muted text-sm font-bold text-subtle-foreground"
          >
            {tournament.shortName.slice(0, 2).toUpperCase()}
          </span>
        ) : (
          <Image
            src={logo}
            alt=""
            width={40}
            height={40}
            className="relative size-10 shrink-0 object-contain"
          />
        )}

        <span className="relative flex min-w-0 flex-col gap-1">
          <h3 className="truncate text-sm font-bold text-foreground">{tournament.name}</h3>
          <span className="flex flex-wrap items-center gap-1.5">
            <TournamentTierBadge tier={tournament.tier} />
            <span
              className={cn(
                "inline-flex h-5 items-center rounded-xs px-1.5 text-overline font-bold uppercase",
                statusTone[tournament.status],
              )}
            >
              {TOURNAMENT_STATUS_LABEL[tournament.status]}
            </span>
          </span>
        </span>

        <ChevronRight
          aria-hidden="true"
          className="relative ml-auto size-5 shrink-0 text-subtle-foreground transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-primary"
        />
      </span>

      <span className="flex flex-1 flex-col gap-2.5 px-4 py-3.5">
        <Row icon={<Trophy className="size-3.5" />} label="Призовой фонд">
          <span className="tabular-nums">
            {formatPrize(tournament.prizePool, tournament.currency, "ru")}
          </span>
        </Row>
        <Row icon={<CalendarDays className="size-3.5" />} label="Даты">
          <span className="tabular-nums">
            <time dateTime={toIsoDate(tournament.startsAt)}>
              {formatDate(tournament.startsAt)}
            </time>
            {" — "}
            <time dateTime={toIsoDate(tournament.endsAt)}>
              {formatDate(tournament.endsAt)}
            </time>
          </span>
        </Row>
        <Row icon={<Users className="size-3.5" />} label="Команды">
          <span className="tabular-nums">{tournament.teams.length}</span>
        </Row>
        <Row icon={<MapPin className="size-3.5" />} label="Формат">
          {tournament.location.online ? "Онлайн" : "LAN"}
          <CountryTag country={tournament.location.country} />
        </Row>
      </span>
    </Link>
  )
}

export function TournamentCardSkeleton() {
  const items = Array.from({ length: 6 }, (_, index) => index)

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <div key={item} className="h-56 rounded-surface border border-border bg-skeleton" />
      ))}
    </div>
  )
}
