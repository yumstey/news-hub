import Image from "next/image"
import Link from "next/link"

import { matchHref, pickStream, twitchChannel, twitchPreview } from "@/entities/match"
import type { Match } from "@/entities/match"
import { TeamLogo } from "@/entities/team"
import { cn } from "@/shared/lib/style"

export type LiveMatchCardProps = {
  match: Match
}

/**
 * Карточка матча в эфире с живым кадром трансляции — как телегид. Превью Twitch
 * не пропускаем через оптимизатор: кадр меняется каждые пять минут.
 */
export function LiveMatchCard({ match }: LiveMatchCardProps) {
  const [first, second] = match.teams
  const stream = pickStream(match.streams)
  const preview = stream === null ? null : twitchPreview(stream.url)
  const channel = stream === null ? null : twitchChannel(stream.url)

  return (
    <Link
      href={matchHref(match.id)}
      className="group flex h-full flex-col overflow-hidden rounded-surface border border-live/30 bg-surface transition-all duration-200 hover:-translate-y-0.5 hover:border-live/60 hover:shadow-surface"
    >
      <span className="relative block aspect-video w-full overflow-hidden bg-muted">
        {preview === null ? (
          <span className="absolute inset-0 flex items-center justify-center gap-6 bg-linear-to-br from-primary-soft via-elevated to-live-soft">
            <TeamLogo logo={first.team.logo} darkLogo={first.team.darkLogo} size={64} className="size-16" />
            <span className="text-heading font-bold text-subtle-foreground">vs</span>
            <TeamLogo logo={second.team.logo} darkLogo={second.team.darkLogo} size={64} className="size-16" />
          </span>
        ) : (
          <Image
            src={preview}
            alt={`Трансляция: ${first.team.name} — ${second.team.name}`}
            fill
            unoptimized
            sizes="(min-width: 1024px) 26rem, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        )}

        <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-1.5 rounded-xs bg-live px-2 py-0.5 text-overline font-bold uppercase text-live-foreground">
          <span aria-hidden="true" className="size-1.5 animate-pulse rounded-full bg-live-foreground" />
          Live
        </span>

        <span className="absolute inset-x-0 bottom-0 flex items-center gap-2 bg-linear-to-t from-black/85 via-black/50 to-transparent px-3 pb-2.5 pt-8 text-white">
          <TeamLogo logo={first.team.logo} darkLogo={first.team.darkLogo} size={20} className="size-5" />
          <span className="min-w-0 flex-1 truncate text-sm font-semibold">{first.team.name}</span>
          <span className="shrink-0 rounded-xs bg-black/50 px-2 py-0.5 text-sm font-bold tabular-nums">
            {match.score === null ? "–" : `${match.score.side1} : ${match.score.side2}`}
          </span>
          <span className="min-w-0 flex-1 truncate text-right text-sm font-semibold">{second.team.name}</span>
          <TeamLogo logo={second.team.logo} darkLogo={second.team.darkLogo} size={20} className="size-5" />
        </span>
      </span>

      <span className="flex items-center justify-between gap-2 px-3 py-2.5">
        <span className="min-w-0 truncate text-caption text-muted-foreground group-hover:text-foreground">
          {match.tournament.name}
        </span>
        <span className={cn("shrink-0 text-overline uppercase", channel === null ? "text-subtle-foreground" : "text-primary")}>
          {channel ?? match.format.toUpperCase()}
        </span>
      </span>
    </Link>
  )
}
