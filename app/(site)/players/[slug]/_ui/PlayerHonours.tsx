import { Award, ExternalLink, Medal, Trophy } from "lucide-react"

import type { PlayerProfile } from "@/entities/player"
import { cn } from "@/shared/lib/style"
import { pluralize } from "@/shared/lib/text"
import { SectionHeading } from "@/shared/ui/section-heading"
import { Text } from "@/shared/ui/typography"

const MVP_PREVIEW = 12

function rankTone(place: number): string {
  if (place === 1) return "border-warning bg-warning-soft text-warning-foreground"
  if (place <= 3) return "border-primary/40 bg-primary-soft text-primary"
  if (place <= 10) return "border-border bg-muted text-foreground"

  return "border-border bg-surface text-muted-foreground"
}

/** Одна строка на год: лучшее место среди источников рейтинга. */
function bestByYear(profile: PlayerProfile) {
  const hltv = profile.rankings.filter((entry) => /hltv/i.test(entry.source))
  const source = hltv.length > 0 ? hltv : profile.rankings
  const byYear = new Map<number, (typeof source)[number]>()

  for (const entry of source) {
    const seen = byYear.get(entry.year)

    if (seen === undefined || entry.place < seen.place) byYear.set(entry.year, entry)
  }

  return [...byYear.values()].sort((left, right) => right.year - left.year)
}

export function PlayerHonours({ profile }: { profile: PlayerProfile }) {
  const rankings = bestByYear(profile)
  const majors = profile.mvps.filter((mvp) => mvp.major)
  const big = profile.mvps.filter((mvp) => mvp.big)

  if (rankings.length === 0 && profile.mvps.length === 0 && profile.awards.length === 0) {
    return null
  }

  return (
    <section className="flex flex-col gap-4">
      <SectionHeading
        title="Награды и признание"
        action={
          profile.page === null ? null : (
            <a
              href={profile.page}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1.5 text-caption text-muted-foreground transition-colors duration-150 hover:text-primary"
            >
              Liquipedia
              <ExternalLink className="size-3.5" />
            </a>
          )
        }
      />

      {rankings.length > 0 ? (
        <div className="flex flex-col gap-2.5 rounded-surface border border-border bg-surface p-5">
          <span className="text-overline uppercase text-subtle-foreground">
            Место в топ-20 игроков года
          </span>
          <ul className="flex flex-wrap gap-2">
            {rankings.map((entry) => (
              <li
                key={`${entry.year}-${entry.source}`}
                className={cn(
                  "flex min-w-16 flex-col items-center gap-0.5 rounded-control border px-3 py-2",
                  rankTone(entry.place),
                )}
              >
                <span className="text-subheading font-bold tabular-nums">#{entry.place}</span>
                <span className="text-overline tabular-nums opacity-70">{entry.year}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {profile.mvps.length > 0 ? (
        <div className="flex flex-col gap-3 rounded-surface border border-border bg-surface p-5">
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-2 text-subheading font-bold text-foreground">
              <Medal className="size-5 text-warning" />
              {profile.mvps.length} MVP
            </span>
            <span className="text-caption text-muted-foreground">
              из них {big.length} на крупных турнирах
              {majors.length > 0 ? ` и ${majors.length} на мейджорах` : ""}
            </span>
          </div>

          <ul className="grid gap-1.5 sm:grid-cols-2">
            {profile.mvps.slice(0, MVP_PREVIEW).map((mvp) => (
              <li
                key={mvp.event}
                className={cn(
                  "flex items-center gap-2 rounded-control px-3 py-1.5 text-caption",
                  mvp.major
                    ? "bg-warning-soft font-semibold text-warning-foreground"
                    : mvp.big
                      ? "bg-muted font-medium text-foreground"
                      : "text-muted-foreground",
                )}
              >
                {mvp.major ? (
                  <Trophy className="size-3.5 shrink-0 text-warning" />
                ) : (
                  <span
                    aria-hidden="true"
                    className="size-1.5 shrink-0 rounded-full bg-border-strong"
                  />
                )}
                <span className="min-w-0 truncate">{mvp.event}</span>
              </li>
            ))}
          </ul>

          {profile.mvps.length > MVP_PREVIEW ? (
            <Text size="caption" tone="subtle">
              И ещё{" "}
              {pluralize(profile.mvps.length - MVP_PREVIEW, [
                "медаль",
                "медали",
                "медалей",
              ])}{" "}
              MVP.
            </Text>
          ) : null}
        </div>
      ) : null}

      {profile.awards.length > 0 ? (
        <ul className="flex flex-col gap-2 rounded-surface border border-border bg-surface p-5">
          {profile.awards.map((award) => (
            <li key={award.text} className="flex items-start gap-2.5">
              <Award className="mt-0.5 size-4 shrink-0 text-subtle-foreground" />
              <span className="text-caption text-muted-foreground">{award.text}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  )
}
