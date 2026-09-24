import { CalendarDays, MapPin, Trophy, Users } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

import { TeamLogo } from "@/entities/team/@x/tournament"
import { formatDayMonth, toIsoDate } from "@/shared/lib/date"
import { cn } from "@/shared/lib/style"
import { pluralize } from "@/shared/lib/text"
import { CountryTag } from "@/shared/ui/country-tag"

import { formatPrize } from "../lib/formatPrize"
import { tournamentHref } from "../lib/tournamentHref"
import { TOURNAMENT_STATUS_LABEL } from "../model/tournament"
import type { Tournament } from "../model/tournament"
import { TournamentTierBadge } from "./TournamentTierBadge"

const ROSTER_PREVIEW = 7

const statusTone: Record<Tournament["status"], string> = {
  ongoing: "bg-live text-live-foreground",
  upcoming: "bg-primary text-primary-foreground",
  finished: "bg-black/55 text-white",
}

function Monogram({ name, className }: { name: string; className?: string }) {
  const letters = name
    .replace(/[^\p{L}\p{N} ]/gu, "")
    .split(/\s+/)
    .filter((word) => word.length > 0)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase()

  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex items-center justify-center rounded-control border border-white/20 bg-black/45 font-bold text-white backdrop-blur-sm",
        className,
      )}
    >
      {letters}
    </span>
  )
}

function Fact({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <span className="flex items-center justify-between gap-3">
      <span className="flex items-center gap-2 text-caption text-subtle-foreground">
        <span aria-hidden="true" className="text-border-strong">
          {icon}
        </span>
        {label}
      </span>
      <span className="flex items-center gap-1.5 text-caption font-semibold text-foreground">{children}</span>
    </span>
  )
}

export type TournamentCardProps = {
  tournament: Tournament
  /** Кадр CS2 под шапкой: у большинства турниров нет своего логотипа. */
  cover?: string | null
  eager?: boolean
  className?: string
}

/**
 * Карточка турнира: обложка с названием, призовой фонд, даты, состав участников
 * логотипами и чемпион — то, ради чего открывают страницу события.
 */
export function TournamentCard({ tournament, cover = null, eager = false, className }: TournamentCardProps) {
  const logo = tournament.ref.logo
  const winner =
    tournament.winnerId === null
      ? undefined
      : tournament.teams.find((team) => team.id === tournament.winnerId)
  const roster = tournament.teams.slice(0, ROSTER_PREVIEW)
  const rest = tournament.teams.length - roster.length

  return (
    <Link
      href={tournamentHref(tournament.slug)}
      className={cn(
        "group flex h-full animate-rise-in flex-col overflow-hidden rounded-surface border border-border bg-surface",
        "transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-surface active:translate-y-0",
        className,
      )}
    >
      <span className="relative flex aspect-[16/6] w-full items-end overflow-hidden bg-muted">
        {cover === null ? (
          <span aria-hidden="true" className="absolute inset-0 bg-linear-to-br from-primary-soft via-elevated to-elevated" />
        ) : (
          <Image
            src={cover}
            alt=""
            fill
            quality={50}
            loading={eager ? "eager" : undefined}
            sizes="(min-width: 1280px) 26rem, (min-width: 768px) 45vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
        <span aria-hidden="true" className="absolute inset-0 bg-linear-to-t from-black/90 via-black/45 to-black/10" />

        <span className="absolute left-3 top-3 flex flex-wrap items-center gap-1.5">
          <span
            className={cn(
              "inline-flex h-5 items-center rounded-xs px-1.5 text-overline font-bold uppercase",
              statusTone[tournament.status],
            )}
          >
            {TOURNAMENT_STATUS_LABEL[tournament.status]}
          </span>
          <TournamentTierBadge tier={tournament.tier} />
        </span>

        <span className="relative flex w-full items-center gap-3 p-3.5">
          {logo === null ? (
            <Monogram name={tournament.shortName} className="size-11 shrink-0 text-sm" />
          ) : (
            <Image
              src={logo}
              alt=""
              width={44}
              height={44}
              className="size-11 shrink-0 rounded-control bg-white/90 object-contain p-1"
            />
          )}
          <span className="min-w-0 flex-1">
            <h3 className="line-clamp-2 text-sm font-bold leading-snug text-white">{tournament.name}</h3>
          </span>
        </span>
      </span>

      <span className="flex flex-1 flex-col gap-2.5 px-4 py-3.5">
        <span className="flex items-baseline justify-between gap-3">
          <span className="text-heading font-bold tabular-nums text-foreground">
            {formatPrize(tournament.prizePool, tournament.currency, "ru")}
          </span>
          <span className="text-caption tabular-nums text-muted-foreground">
            <time dateTime={toIsoDate(tournament.startsAt)}>{formatDayMonth(tournament.startsAt)}</time>
            {" — "}
            <time dateTime={toIsoDate(tournament.endsAt)}>{formatDayMonth(tournament.endsAt)}</time>
          </span>
        </span>

        {roster.length === 0 ? null : (
          <span className="flex items-center gap-1.5">
            {roster.map((team) => (
              <TeamLogo
                key={team.id}
                logo={team.logo}
                darkLogo={team.darkLogo}
                size={22}
                className="size-5.5 rounded-xs"
              />
            ))}
            {rest > 0 ? (
              <span className="text-overline tabular-nums text-subtle-foreground">+{rest}</span>
            ) : null}
          </span>
        )}

        <span className="mt-auto flex flex-col gap-2 pt-1">
          {winner === undefined ? (
            <Fact icon={<Users className="size-3.5" />} label="Участники">
              {tournament.teams.length === 0
                ? "уточняется"
                : pluralize(tournament.teams.length, ["команда", "команды", "команд"])}
            </Fact>
          ) : (
            <Fact icon={<Trophy className="size-3.5" />} label="Чемпион">
              <TeamLogo logo={winner.logo} darkLogo={winner.darkLogo} size={18} className="size-4.5" />
              {winner.name}
            </Fact>
          )}

          <Fact icon={<MapPin className="size-3.5" />} label="Формат">
            {tournament.location.online ? "Онлайн" : "LAN"}
            <CountryTag country={tournament.location.country} />
          </Fact>
        </span>
      </span>
    </Link>
  )
}

/** Компактная строка для длинных списков завершённых турниров. */
export function TournamentRow({ tournament, className }: { tournament: Tournament; className?: string }) {
  const logo = tournament.ref.logo
  const winner =
    tournament.winnerId === null
      ? undefined
      : tournament.teams.find((team) => team.id === tournament.winnerId)

  return (
    <Link
      href={tournamentHref(tournament.slug)}
      className={cn(
        "group flex items-center gap-3 px-4 py-3 transition-colors duration-150 hover:bg-muted/70",
        className,
      )}
    >
      {logo === null ? (
        <Monogram name={tournament.shortName} className="size-9 shrink-0 border-border bg-muted text-caption text-muted-foreground" />
      ) : (
        <Image src={logo} alt="" width={36} height={36} className="size-9 shrink-0 rounded-sm bg-muted object-contain p-0.5" />
      )}

      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate text-caption font-semibold text-foreground transition-colors duration-150 group-hover:text-primary">
          {tournament.name}
        </span>
        <span className="flex items-center gap-1.5 text-overline tracking-normal tabular-nums text-subtle-foreground">
          <CalendarDays aria-hidden="true" className="size-3" />
          {formatDayMonth(tournament.startsAt)} — {formatDayMonth(tournament.endsAt)}
          <span aria-hidden="true">·</span>
          {formatPrize(tournament.prizePool, tournament.currency, "ru")}
        </span>
      </span>

      {winner === undefined ? (
        <TournamentTierBadge tier={tournament.tier} className="shrink-0" />
      ) : (
        <span className="flex shrink-0 items-center gap-1.5 text-caption font-semibold text-foreground">
          <Trophy aria-hidden="true" className="size-3.5 text-warning" />
          <TeamLogo logo={winner.logo} darkLogo={winner.darkLogo} size={18} className="size-4.5" />
          <span className="hidden sm:inline">{winner.name}</span>
        </span>
      )}
    </Link>
  )
}

export function TournamentCardSkeleton() {
  const items = Array.from({ length: 6 }, (_, index) => index)

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <div key={item} className="h-72 rounded-surface border border-border bg-skeleton" />
      ))}
    </div>
  )
}
