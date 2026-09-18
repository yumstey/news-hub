import Link from "next/link"

import type { PlayerOutcome, PlayerRecord as Record, PlayerSeason } from "@/entities/player"
import { teamHref, TeamLogo } from "@/entities/team"
import { formatDate } from "@/shared/lib/date"
import { cn } from "@/shared/lib/style"
import { plural, pluralize } from "@/shared/lib/text"
import { SectionHeading } from "@/shared/ui/section-heading"
import { Text } from "@/shared/ui/typography"

function Donut({ value }: { value: number }) {
  return (
    <svg viewBox="0 0 36 36" className="size-20 shrink-0 -rotate-90" aria-hidden="true">
      <circle
        cx="18"
        cy="18"
        r="15.915"
        fill="none"
        strokeWidth="3.5"
        className="stroke-muted"
      />
      <circle
        cx="18"
        cy="18"
        r="15.915"
        fill="none"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeDasharray={`${value} 100`}
        className="stroke-primary"
      />
    </svg>
  )
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "win" | "loss" }) {
  return (
    <div className="flex flex-col gap-1 rounded-control bg-muted px-4 py-3">
      <span
        className={cn(
          "text-subheading font-bold tabular-nums",
          tone === "win" ? "text-success" : tone === "loss" ? "text-danger" : "text-foreground",
        )}
      >
        {value}
      </span>
      <span className="text-overline uppercase text-subtle-foreground">{label}</span>
    </div>
  )
}

function FormPill({ outcome }: { outcome: PlayerOutcome }) {
  return (
    <span
      title={outcome === "win" ? "Победа" : "Поражение"}
      className={cn(
        "flex size-6 items-center justify-center rounded-xs text-overline font-bold",
        outcome === "win"
          ? "bg-success text-success-foreground"
          : "bg-danger text-danger-foreground",
      )}
    >
      {outcome === "win" ? "В" : "П"}
    </span>
  )
}

function SeasonRow({ season }: { season: PlayerSeason }) {
  const total = season.wins + season.losses
  const share = total === 0 ? 0 : Math.round((season.wins / total) * 100)

  return (
    <li className="grid grid-cols-[3rem_minmax(0,1fr)_5.5rem] items-center gap-3">
      <span className="text-caption font-bold tabular-nums text-foreground">{season.year}</span>

      <svg
        viewBox="0 0 100 8"
        preserveAspectRatio="none"
        aria-hidden="true"
        className="h-2 w-full overflow-hidden rounded-full"
      >
        <rect x="0" y="0" width="100" height="8" className="fill-danger-soft" />
        <rect x="0" y="0" width={share} height="8" className="fill-success" />
      </svg>

      <span className="text-right text-caption tabular-nums text-muted-foreground">
        <span className="font-semibold text-success">{season.wins}</span>
        <span className="mx-1 text-subtle-foreground">—</span>
        <span className="font-semibold text-danger">{season.losses}</span>
      </span>
    </li>
  )
}

export function PlayerRecord({ record }: { record: Record }) {
  if (record.matches === 0) return null

  const streakLabel =
    record.streak === null
      ? "—"
      : pluralize(
          record.streak.length,
          record.streak.kind === "win"
            ? ["победа", "победы", "побед"]
            : ["поражение", "поражения", "поражений"],
        )

  return (
    <section className="flex flex-col gap-4">
      <SectionHeading
        title="Матчевая статистика"
        action={
          record.since === null ? null : (
            <span className="text-caption text-subtle-foreground">
              с {formatDate(record.since)}
            </span>
          )
        }
      />

      <div className="flex flex-col gap-5 rounded-surface border border-border bg-surface p-5">
        <div className="flex flex-wrap items-center gap-5">
          <div className="relative flex items-center justify-center">
            <Donut value={record.winrate} />
            <span className="absolute flex flex-col items-center">
              <span className="text-subheading font-bold tabular-nums text-foreground">
                {record.winrate}%
              </span>
              <span className="text-overline uppercase text-subtle-foreground">винрейт</span>
            </span>
          </div>

          <div className="grid min-w-0 flex-1 grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Матчей" value={String(record.matches)} />
            <Stat label="Побед" value={String(record.wins)} tone="win" />
            <Stat label="Поражений" value={String(record.losses)} tone="loss" />
            <Stat label="Карты" value={`${record.mapsWon}—${record.mapsLost}`} />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <div className="flex items-center gap-2">
            <span className="text-overline uppercase text-subtle-foreground">Форма</span>
            <span className="flex gap-1">
              {record.form.map((outcome, index) => (
                <FormPill key={`${outcome}-${index}`} outcome={outcome} />
              ))}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-overline uppercase text-subtle-foreground">Серия</span>
            <span
              className={cn(
                "text-caption font-semibold tabular-nums",
                record.streak?.kind === "win"
                  ? "text-success"
                  : record.streak?.kind === "loss"
                    ? "text-danger"
                    : "text-muted-foreground",
              )}
            >
              {streakLabel}
            </span>
          </div>
        </div>

        {record.seasons.length > 0 ? (
          <div className="flex flex-col gap-2 border-t border-border pt-4">
            <span className="text-overline uppercase text-subtle-foreground">По сезонам</span>
            <ul className="flex flex-col gap-2">
              {record.seasons.map((season) => (
                <SeasonRow key={season.year} season={season} />
              ))}
            </ul>
          </div>
        ) : null}

        {record.rivals.length > 0 ? (
          <div className="flex flex-col gap-2 border-t border-border pt-4">
            <span className="text-overline uppercase text-subtle-foreground">
              Чаще всего играл против
            </span>
            <ul className="grid gap-2 sm:grid-cols-2">
              {record.rivals.map((rival) => (
                <li key={rival.team.id}>
                  <Link
                    href={teamHref(rival.team.slug)}
                    className={cn(
                      "flex min-h-11 items-center gap-2.5 rounded-control border border-border px-3 py-2",
                      "transition-colors duration-150 hover:border-border-strong hover:bg-muted/60",
                    )}
                  >
                    <TeamLogo
                      logo={rival.team.logo}
                      darkLogo={rival.team.darkLogo}
                      size={22}
                      className="size-[22px]"
                    />
                    <span className="min-w-0 flex-1 truncate text-caption text-foreground">
                      {rival.team.name}
                    </span>
                    <span className="shrink-0 text-caption tabular-nums">
                      <span className="font-semibold text-success">{rival.wins}</span>
                      <span className="mx-0.5 text-subtle-foreground">—</span>
                      <span className="font-semibold text-danger">{rival.losses}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>

      <Text size="caption" tone="subtle">
        Считается по последним {record.matches}{" "}
        {plural(record.matches, ["сыгранному матчу", "сыгранным матчам", "сыгранным матчам"])} из
        базы PandaScore. Клубы игрока определяются автоматически по составам его матчей.
      </Text>
    </section>
  )
}
