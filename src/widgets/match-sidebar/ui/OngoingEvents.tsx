import Image from "next/image"
import Link from "next/link"

import {
  formatPrize,
  getTournaments,
  TournamentTierBadge,
  tournamentHref,
} from "@/entities/tournament"
import type { Tournament } from "@/entities/tournament"
import { ROUTES } from "@/shared/config"
import { formatDayMonth } from "@/shared/lib/date"

import { SidebarCard } from "./SidebarCard"

const LIMIT = 6

function EventLine({ tournament }: { tournament: Tournament }) {
  const logo = tournament.ref.logo
  const prize = tournament.prizePool === null ? null : formatPrize(tournament.prizePool, tournament.currency, "ru-RU")

  return (
    <li>
      <Link
        href={tournamentHref(tournament.slug)}
        className="group flex items-center gap-3 px-4 py-2.5 transition-colors duration-150 hover:bg-muted/70"
      >
        {logo === null ? (
          <span
            aria-hidden="true"
            className="flex size-8 shrink-0 items-center justify-center rounded-xs bg-muted text-caption font-bold text-subtle-foreground"
          >
            {tournament.name.slice(0, 1).toUpperCase()}
          </span>
        ) : (
          <Image src={logo} alt="" width={32} height={32} className="size-8 shrink-0 object-contain" />
        )}
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="truncate text-caption font-semibold text-foreground transition-colors duration-150 group-hover:text-primary">
            {tournament.name}
          </span>
          <span className="flex items-center gap-1.5 text-overline tracking-normal tabular-nums text-subtle-foreground">
            {formatDayMonth(tournament.startsAt)} — {formatDayMonth(tournament.endsAt)}
            {prize === null ? null : (
              <>
                <span aria-hidden="true">·</span>
                <span className="font-semibold text-success">{prize}</span>
              </>
            )}
          </span>
        </span>
        {tournament.tier === "s" || tournament.tier === "a" ? (
          <TournamentTierBadge tier={tournament.tier} className="shrink-0" />
        ) : null}
      </Link>
    </li>
  )
}

/** Идущие и ближайшие крупные турниры — навигация «куда смотреть» рядом с расписанием. */
export async function OngoingEvents() {
  const result = await getTournaments()

  if (!result.ok) return null

  const ongoing = result.data.filter((tournament) => tournament.status === "ongoing")
  const upcoming = result.data
    .filter((tournament) => tournament.status === "upcoming" && (tournament.tier === "s" || tournament.tier === "a"))
    .sort((left, right) => left.startsAt.getTime() - right.startsAt.getTime())

  if (ongoing.length === 0 && upcoming.length === 0) return null

  return (
    <SidebarCard title="Турниры" moreHref={ROUTES.events} moreLabel="Все турниры">
      {ongoing.length === 0 ? null : (
        <>
          <p className="px-4 pt-3 text-overline font-semibold uppercase text-live">Идут сейчас</p>
          <ul className="flex flex-col py-1">
            {ongoing.slice(0, LIMIT).map((tournament) => (
              <EventLine key={tournament.id} tournament={tournament} />
            ))}
          </ul>
        </>
      )}
      {upcoming.length === 0 ? null : (
        <>
          <p className="border-t border-border px-4 pt-3 text-overline font-semibold uppercase text-subtle-foreground">
            Скоро
          </p>
          <ul className="flex flex-col py-1">
            {upcoming.slice(0, 3).map((tournament) => (
              <EventLine key={tournament.id} tournament={tournament} />
            ))}
          </ul>
        </>
      )}
    </SidebarCard>
  )
}
