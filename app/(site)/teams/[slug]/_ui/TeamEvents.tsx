import { CalendarDays, Trophy } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

import { formatPrize, getTournaments, TournamentTierBadge, tournamentHref } from "@/entities/tournament"
import { formatDayMonth } from "@/shared/lib/date"
import { SectionHeading } from "@/shared/ui/section-heading"

const LIMIT = 4

export type TeamEventsProps = {
  teamId: string
  teamName: string
}

/**
 * Турниры, где команда заявлена. Расписание отдельных матчей появляется в API
 * за пару дней до игр, а состав участников известен заранее — так страница не
 * выглядит пустой между турнирами.
 */
export async function TeamEvents({ teamId, teamName }: TeamEventsProps) {
  const result = await getTournaments()

  if (!result.ok) return null

  const events = result.data
    .filter((tournament) => tournament.status !== "finished")
    .filter((tournament) => tournament.teams.some((team) => team.id === teamId))
    .sort((left, right) => left.startsAt.getTime() - right.startsAt.getTime())
    .slice(0, LIMIT)

  if (events.length === 0) return null

  return (
    <section className="flex flex-col gap-4">
      <SectionHeading title={`Турниры ${teamName}`} />

      <div className="overflow-hidden rounded-surface border border-border bg-surface">
        <ul className="divide-y divide-border">
          {events.map((tournament) => (
            <li key={tournament.id}>
              <Link
                href={tournamentHref(tournament.slug)}
                className="group flex items-center gap-3 px-4 py-3 transition-colors duration-150 hover:bg-muted/70"
              >
                {tournament.ref.logo === null ? (
                  <span
                    aria-hidden="true"
                    className="flex size-9 shrink-0 items-center justify-center rounded-xs bg-muted text-caption font-bold text-subtle-foreground"
                  >
                    {tournament.shortName.slice(0, 2).toUpperCase()}
                  </span>
                ) : (
                  <Image
                    src={tournament.ref.logo}
                    alt=""
                    width={36}
                    height={36}
                    className="size-9 shrink-0 rounded-sm bg-muted object-contain p-0.5"
                  />
                )}

                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="truncate text-caption font-semibold text-foreground transition-colors duration-150 group-hover:text-primary">
                    {tournament.name}
                  </span>
                  <span className="flex items-center gap-1.5 text-overline tracking-normal tabular-nums text-subtle-foreground">
                    <CalendarDays aria-hidden="true" className="size-3" />
                    {formatDayMonth(tournament.startsAt)} — {formatDayMonth(tournament.endsAt)}
                    {tournament.prizePool === null ? null : (
                      <>
                        <Trophy aria-hidden="true" className="ml-1 size-3 text-warning" />
                        {formatPrize(tournament.prizePool, tournament.currency, "ru")}
                      </>
                    )}
                  </span>
                </span>

                <TournamentTierBadge tier={tournament.tier} className="shrink-0" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
