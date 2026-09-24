import Image from "next/image"
import Link from "next/link"

import { channelOf, twitchPreview } from "@/entities/match"
import type { StreamEntry, StreamGroup } from "@/entities/match"
import { tournamentHref } from "@/entities/tournament"
import { SITE_URL } from "@/shared/config"
import { cn } from "@/shared/lib/style"
import { BrandIcon } from "@/shared/ui/brand-icon"
import type { BrandKey } from "@/shared/ui/brand-icon"

import { StreamFrame } from "./StreamFrame"

const BRAND: Record<string, BrandKey> = { twitch: "twitch", youtube: "youtube" }

function parentHost(): string {
  try {
    return new URL(SITE_URL).hostname
  } catch {
    return "localhost"
  }
}

function youtubeId(url: string): string | null {
  return /(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{6,})/.exec(url)?.[1] ?? null
}

/**
 * Адрес плеера. autoplay включаем только когда зритель сам нажал «смотреть»:
 * иначе десяток эфиров на странице начинал играть одновременно.
 */
export function embedUrl(entry: StreamEntry, autoplay: boolean): string | null {
  const { platform, url } = entry.stream

  if (platform === "youtube") {
    const id = youtubeId(url)

    return id === null ? null : `https://www.youtube.com/embed/${id}?autoplay=${autoplay ? 1 : 0}`
  }

  if (platform === "kick") {
    return `https://player.kick.com/${encodeURIComponent(channelOf(url))}?autoplay=${autoplay}`
  }

  if (platform === "twitch") {
    return `https://player.twitch.tv/?channel=${encodeURIComponent(channelOf(url))}&parent=${parentHost()}&muted=true&autoplay=${autoplay}`
  }

  return null
}

export function playableEntry(group: StreamGroup): StreamEntry | null {
  if (!group.live) return null

  return group.entries.find((entry) => embedUrl(entry, false) !== null) ?? null
}

/** Кадр трансляции для карточки, которая ещё не запущена. */
function posterFor(entry: StreamEntry): string | null {
  const { platform, url } = entry.stream

  if (platform === "twitch") return twitchPreview(url, 640, 360)
  if (platform === "youtube") {
    const id = youtubeId(url)

    return id === null ? null : `https://i.ytimg.com/vi/${id}/hq720.jpg`
  }

  return null
}

export type StreamPlayerProps = {
  group: StreamGroup
  /** Первый эфир на странице стартует сразу, остальные — по клику. */
  autoStart?: boolean
}

export function StreamPlayer({ group, autoStart = false }: StreamPlayerProps) {
  const entry = playableEntry(group)

  if (entry === null) return null

  const idle = embedUrl(entry, false)
  const active = embedUrl(entry, true)

  if (idle === null || active === null) return null

  const brand = BRAND[entry.stream.platform]
  const [first, second] = entry.match.teams

  return (
    <article className="flex animate-rise-in flex-col gap-3">
      <StreamFrame
        title={`Трансляция ${group.name}`}
        idleSrc={idle}
        activeSrc={active}
        poster={posterFor(entry)}
        autoStart={autoStart}
        label={`${first.team.name} — ${second.team.name}`}
      />

      <header className="flex flex-wrap items-center gap-3">
        {group.logo === null ? null : (
          <Image
            src={group.logo}
            alt=""
            width={44}
            height={44}
            className="size-11 shrink-0 object-contain"
          />
        )}

        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <Link href={tournamentHref(group.slug)} className="min-w-0">
            <h2 className="truncate text-title text-foreground transition-colors duration-150 hover:text-primary">
              {group.name}
            </h2>
          </Link>
          <p className="truncate text-caption text-muted-foreground">
            {first.team.name} — {second.team.name}
          </p>
        </div>

        <a
          href={entry.stream.url}
          target="_blank"
          rel="noopener noreferrer external"
          className={cn(
            "inline-flex h-11 shrink-0 items-center gap-2 rounded-control border border-border px-4",
            "text-caption font-semibold text-foreground transition-colors duration-150",
            "hover:border-border-strong hover:bg-muted",
          )}
        >
          {brand === undefined ? null : <BrandIcon brand={brand} className="size-4" />}
          {channelOf(entry.stream.url)}
          <span className="text-overline uppercase text-subtle-foreground">
            {entry.stream.language}
          </span>
        </a>
      </header>
    </article>
  )
}

export function StreamsSkeleton() {
  const items = Array.from({ length: 2 }, (_, index) => index)

  return (
    <div className="grid gap-8 xl:grid-cols-2">
      {items.map((item) => (
        <div key={item} className="aspect-video rounded-surface border border-border bg-skeleton" />
      ))}
    </div>
  )
}
