import { Trophy } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

import type { TeamAchievements } from "@/entities/team"
import { TOURNAMENT_TIER_LABEL, tournamentHref } from "@/entities/tournament"
import { formatDate } from "@/shared/lib/date"
import { cn } from "@/shared/lib/style"
import { SectionHeading } from "@/shared/ui/section-heading"
import { Text } from "@/shared/ui/typography"

const MAX_ROWS = 12

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-control bg-muted px-4 py-3">
      <span className="text-subheading font-bold tabular-nums text-foreground">{value}</span>
      <span className="text-overline uppercase text-subtle-foreground">{label}</span>
    </div>
  )
}

function EventMark({ logo, name, won }: { logo: string | null; name: string; won: boolean }) {
  if (logo !== null) {
    return (
      <Image
        src={logo}
        alt={name}
        width={32}
        height={32}
        className="size-8 shrink-0 object-contain"
      />
    )
  }

  return (
    <span
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-control",
        won ? "bg-warning-soft text-warning" : "bg-muted text-subtle-foreground",
      )}
    >
      <Trophy aria-hidden="true" className="size-4" />
    </span>
  )
}

export function TeamTrophies({ achievements }: { achievements: TeamAchievements }) {
  if (achievements.tournamentsPlayed === 0) return null

  const rows = achievements.items.slice(0, MAX_ROWS)

  return (
    <section className="flex flex-col gap-4">
      <SectionHeading title="Достижения" />

      <div className="grid grid-cols-3 gap-3">
        <Stat label="Титулы" value={String(achievements.titles)} />
        <Stat label="Топ-турниры" value={String(achievements.tierOneTitles)} />
        <Stat label="Турниров" value={String(achievements.tournamentsPlayed)} />
      </div>

      <ul className="grid gap-2 sm:grid-cols-2">
        {rows.map((item) => (
          <li key={item.id}>
            <Link
              href={tournamentHref(item.slug)}
              className={cn(
                "flex min-h-16 items-center gap-3 rounded-control border bg-surface px-3 py-2.5 transition-colors duration-150 hover:border-border-strong hover:bg-muted/60 active:bg-muted",
                item.won ? "border-warning/40" : "border-border",
              )}
            >
              <EventMark logo={item.logo} name={item.name} won={item.won} />

              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="truncate text-sm font-medium text-foreground">{item.name}</span>
                <span className="flex items-center gap-2 text-caption text-subtle-foreground">
                  <span className="uppercase">{TOURNAMENT_TIER_LABEL[item.tier]}</span>
                  <span aria-hidden="true">·</span>
                  <span className="tabular-nums">{formatDate(item.startsAt)}</span>
                </span>
              </span>

              {item.won ? (
                <Trophy aria-hidden="true" className="size-4 shrink-0 text-warning" />
              ) : null}
            </Link>
          </li>
        ))}
      </ul>

      {achievements.items.length > rows.length ? (
        <Text size="caption" tone="subtle">
          Показаны последние {rows.length} из {achievements.items.length} турниров.
        </Text>
      ) : null}
    </section>
  )
}
