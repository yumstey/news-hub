import { Trophy } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

import type { PlayerCareer as Career } from "@/entities/player"
import { TOURNAMENT_TIER_LABEL, tournamentHref } from "@/entities/tournament"
import { formatDate } from "@/shared/lib/date"
import { cn } from "@/shared/lib/style"
import { SectionHeading } from "@/shared/ui/section-heading"
import { Text } from "@/shared/ui/typography"

const MAX_EVENTS = 16

export function PlayerCareer({ career }: { career: Career }) {
  if (career.events.length === 0) return null

  const events = career.events.slice(0, MAX_EVENTS)
  const years = [...new Set(events.map((event) => event.year))].sort((a, b) => b - a)

  return (
    <section className="flex flex-col gap-4">
      <SectionHeading title="Турнирный путь" />

      <div className="flex flex-col gap-6">
        {years.map((year) => (
          <div key={year} className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <span className="text-caption font-bold tabular-nums text-foreground">{year}</span>
              <span aria-hidden="true" className="h-px flex-1 bg-border" />
            </div>

            <ul className="grid gap-2 sm:grid-cols-2">
              {events
                .filter((event) => event.year === year)
                .map((event) => (
                  <li key={event.id}>
                    <Link
                      href={tournamentHref(event.slug)}
                      className={cn(
                        "flex min-h-16 animate-rise-in items-center gap-3 rounded-control border border-border bg-surface px-3 py-2.5",
                        "transition-all duration-200 hover:-translate-y-px hover:border-border-strong hover:bg-muted/60 hover:shadow-surface",
                      )}
                    >
                      {event.logo === null ? (
                        <span
                          aria-hidden="true"
                          className="flex size-8 shrink-0 items-center justify-center rounded-control bg-muted text-subtle-foreground"
                        >
                          <Trophy className="size-4" />
                        </span>
                      ) : (
                        <Image
                          src={event.logo}
                          alt=""
                          width={32}
                          height={32}
                          className="size-8 shrink-0 object-contain"
                        />
                      )}

                      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <span className="truncate text-sm font-medium text-foreground">
                          {event.name}
                        </span>
                        <span className="flex items-center gap-2 text-caption text-subtle-foreground">
                          <span className="uppercase">{TOURNAMENT_TIER_LABEL[event.tier]}</span>
                          <span aria-hidden="true">·</span>
                          <span className="tabular-nums">{formatDate(event.startsAt)}</span>
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </div>

      {career.events.length > events.length ? (
        <Text size="caption" tone="subtle">
          Показаны последние {events.length} из {career.events.length} турниров.
        </Text>
      ) : null}
    </section>
  )
}
