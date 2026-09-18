import { Clock, Play } from "lucide-react"
import Image from "next/image"

import { MapImage, toMapSlug } from "@/entities/game-map"
import type { GameMap, MapHalf, MapResult, MatchMaps as MapDetail } from "@/entities/game-map"
import type { Match, MatchSide } from "@/entities/match"
import { TeamLogo } from "@/entities/team"
import { cn } from "@/shared/lib/style"
import { SectionHeading } from "@/shared/ui/section-heading"
import { Text } from "@/shared/ui/typography"

const SIDE_LABEL: Record<MapHalf["side"], string> = { t: "T", ct: "CT" }

type Chapter = { label: string; seconds: number; href: string }
type Recording = { id: string; href: string; chapters: Chapter[] }

/** Ссылки Liquipedia бывают вида youtu.be/ID&t=21 — разбираем обе формы. */
function youtubeOf(url: string): { id: string; seconds: number } | null {
  const id = /(?:youtu\.be\/|[?&]v=)([A-Za-z0-9_-]{11})/.exec(url)?.[1]

  if (id === undefined) return null

  const seconds = Number(/[?&]t=(\d+)/.exec(url)?.[1] ?? 0)

  return { id, seconds: Number.isFinite(seconds) ? seconds : 0 }
}

function timecode(total: number): string {
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const seconds = total % 60
  const pad = (value: number) => String(value).padStart(2, "0")

  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(seconds)}` : `${minutes}:${pad(seconds)}`
}

/**
 * Карты одного матча обычно лежат в одном видео трансляции с разными
 * таймкодами — показываем одно превью и оглавление по картам.
 */
function recordingsOf(maps: readonly MapResult[], catalogue: Map<string, GameMap>): Recording[] {
  const byVideo = new Map<string, Recording>()

  maps.forEach((map, index) => {
    if (!map.played || map.vod === null) return

    const video = youtubeOf(map.vod)

    if (video === null) return

    const entry = byVideo.get(video.id) ?? {
      id: video.id,
      href: `https://www.youtube.com/watch?v=${video.id}`,
      chapters: [],
    }

    entry.chapters.push({
      label: `Карта ${index + 1} · ${catalogue.get(toMapSlug(map.name))?.name ?? map.name}`,
      seconds: video.seconds,
      href: `https://www.youtube.com/watch?v=${video.id}&t=${video.seconds}s`,
    })
    byVideo.set(video.id, entry)
  })

  return [...byVideo.values()]
}

function Recordings({ recordings }: { recordings: readonly Recording[] }) {
  if (recordings.length === 0) return null

  return (
    <div className="flex flex-col gap-3">
      <span className="text-overline uppercase text-subtle-foreground">Записи трансляции</span>
      <ul className="grid gap-3 md:grid-cols-2">
        {recordings.map((recording) => (
          <li key={recording.id} className="flex gap-3 rounded-surface border border-border bg-surface p-2.5">
            <a
              href={recording.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative block aspect-video w-40 shrink-0 overflow-hidden rounded-control bg-muted sm:w-48"
            >
              <Image
                src={`https://i.ytimg.com/vi/${recording.id}/mqdefault.jpg`}
                alt="Запись матча на YouTube"
                fill
                sizes="12rem"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <span className="absolute inset-0 flex items-center justify-center bg-black/25">
                <span className="flex size-9 items-center justify-center rounded-full bg-youtube text-white shadow-overlay">
                  <Play aria-hidden="true" className="ml-0.5 size-4 fill-current" />
                </span>
              </span>
            </a>
            <ul className="flex min-w-0 flex-1 flex-col justify-center gap-1">
              {recording.chapters.map((chapter) => (
                <li key={chapter.href}>
                  <a
                    href={chapter.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-baseline justify-between gap-2 rounded-xs px-1.5 py-1 text-caption text-foreground transition-colors duration-150 hover:bg-muted hover:text-primary"
                  >
                    <span className="truncate">{chapter.label}</span>
                    <span className="shrink-0 font-mono text-overline tabular-nums text-subtle-foreground">
                      {timecode(chapter.seconds)}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  )
}

function duration(seconds: number | null): string | null {
  if (seconds === null || seconds <= 0) return null

  return `${Math.round(seconds / 60)} мин`
}

function sideOf(match: Match, teamId: string | null): MatchSide | null {
  if (teamId === null) return null

  return match.teams.find((side) => side.team.id === teamId) ?? null
}

function TeamScore({
  side,
  score,
  won,
  pending,
}: {
  side: MatchSide
  score: number
  won: boolean
  pending: boolean
}) {
  return (
    <span className="flex items-center gap-2">
      <TeamLogo
        logo={side.team.logo}
        darkLogo={side.team.darkLogo}
        size={20}
        className="size-5"
      />
      <span
        className={cn(
          "min-w-0 flex-1 truncate text-caption",
          won ? "font-semibold text-foreground" : "text-muted-foreground",
        )}
      >
        {side.team.name}
      </span>
      <span
        className={cn(
          "shrink-0 text-sm font-bold tabular-nums",
          pending ? "text-subtle-foreground" : won ? "text-success" : "text-danger",
        )}
      >
        {pending ? "—" : score}
      </span>
    </span>
  )
}

function HalfBadge({ half }: { half: MapHalf }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-xs bg-muted px-1.5 py-0.5">
      <span
        className={cn(
          "text-overline font-bold",
          half.side === "t" ? "text-warning" : "text-primary",
        )}
      >
        {SIDE_LABEL[half.side]}
      </span>
      <span className="text-overline tabular-nums text-muted-foreground">
        {half.first}:{half.second}
      </span>
    </span>
  )
}

function MapCard({
  match,
  position,
  result,
  map,
  lengthSeconds,
}: {
  match: Match
  position: number | null
  result: MapResult
  map: GameMap | null
  lengthSeconds: number | null
}) {
  const [first, second] = match.teams
  const length = duration(lengthSeconds)
  const firstWon = result.played && result.first > result.second
  const secondWon = result.played && result.second > result.first

  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-surface border bg-surface",
        "transition-all duration-200 hover:-translate-y-px hover:shadow-surface",
        result.played ? "border-border" : "border-dashed border-border",
      )}
    >
      <div className="relative aspect-video w-full">
        <MapImage
          map={map}
          fallbackName={result.name}
          dimmed={!result.played}
          className="absolute inset-0 size-full"
        />

        <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-2.5">
          {position === null ? (
            <span />
          ) : (
            <span className="rounded-xs bg-black/55 px-1.5 py-0.5 text-overline font-bold uppercase text-white backdrop-blur-xs">
              Карта {position}
            </span>
          )}
          {length === null ? null : (
            <span className="inline-flex items-center gap-1 rounded-xs bg-black/55 px-1.5 py-0.5 text-overline tabular-nums text-white backdrop-blur-xs">
              <Clock aria-hidden="true" className="size-3" />
              {length}
            </span>
          )}
        </div>

        <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-3">
          <span className="text-subheading font-bold uppercase tracking-wide text-white drop-shadow">
            {map?.name ?? result.name}
          </span>
          {result.played ? null : (
            <span className="rounded-xs bg-black/55 px-1.5 py-0.5 text-overline uppercase text-white/90">
              не игралась
            </span>
          )}
        </span>
      </div>

      <div className="flex flex-col gap-1.5 p-3">
        <TeamScore side={first} score={result.first} won={firstWon} pending={!result.played} />
        <TeamScore side={second} score={result.second} won={secondWon} pending={!result.played} />
      </div>

      {result.halves === null && result.vod === null ? null : (
        <div className="flex flex-wrap items-center gap-1.5 border-t border-border px-3 py-2">
          {result.halves?.map((half) => <HalfBadge key={half.side} half={half} />)}
          {result.vod === null ? null : (
            <a
              href={result.vod}
              target="_blank"
              rel="noreferrer noopener"
              className="ml-auto inline-flex items-center gap-1 text-overline uppercase text-muted-foreground transition-colors duration-150 hover:text-primary"
            >
              <Play aria-hidden="true" className="size-3" />
              Запись
            </a>
          )}
        </div>
      )}
    </div>
  )
}

/** Запасной вид: без вики известен только номер карты и её победитель. */
function GameCard({ match, position, winnerTeamId, lengthSeconds, finished }: {
  match: Match
  position: number
  winnerTeamId: string | null
  lengthSeconds: number | null
  finished: boolean
}) {
  const winner = sideOf(match, winnerTeamId)
  const length = duration(lengthSeconds)

  return (
    <div
      className={cn(
        "flex min-h-24 flex-col justify-between rounded-surface border bg-surface p-4",
        winner === null ? "border-border" : "border-success/40",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-overline uppercase tracking-wider text-subtle-foreground">
          Карта {position}
        </span>
        {length === null ? null : (
          <span className="inline-flex items-center gap-1 text-overline tabular-nums text-subtle-foreground">
            <Clock aria-hidden="true" className="size-3" />
            {length}
          </span>
        )}
      </div>

      <div className="mt-3 flex items-center gap-2.5">
        {!finished ? (
          <Text as="span" size="caption" tone="subtle">
            Ещё не сыграна
          </Text>
        ) : winner === null ? (
          <Text as="span" size="caption" tone="subtle">
            Результат не опубликован
          </Text>
        ) : (
          <>
            <TeamLogo
              logo={winner.team.logo}
              darkLogo={winner.team.darkLogo}
              size={24}
              className="size-6 rounded-xs"
            />
            <span className="truncate text-sm font-semibold text-success">
              {winner.team.name}
            </span>
          </>
        )}
      </div>
    </div>
  )
}

export type MatchMapsProps = {
  match: Match
  detail: MapDetail
  catalogue: readonly GameMap[]
  className?: string
}

export function MatchMaps({ match, detail, catalogue, className }: MatchMapsProps) {
  if (detail.maps.length === 0 && match.games.length === 0) return null

  const bySlug = new Map(catalogue.map((entry) => [entry.slug, entry]))
  const played = detail.maps.filter((map) => map.played)

  return (
    <section className={cn("flex flex-col gap-4", className)}>
      <SectionHeading
        title="Карты"
        action={
          detail.hltvUrl === null ? null : (
            <a
              href={detail.hltvUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="text-caption text-muted-foreground transition-colors duration-150 hover:text-primary"
            >
              Матч на HLTV
            </a>
          )
        }
      />

      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {detail.maps.length > 0
          ? detail.maps.map((result, index) => {
              const position = result.played ? played.indexOf(result) + 1 : null

              return (
                <li key={`${result.name}-${index}`}>
                  <MapCard
                    match={match}
                    position={position}
                    result={result}
                    map={bySlug.get(toMapSlug(result.name)) ?? null}
                    lengthSeconds={
                      position === null
                        ? null
                        : (match.games[position - 1]?.lengthSeconds ?? null)
                    }
                  />
                </li>
              )
            })
          : match.games.map((game) => (
              <li key={game.position}>
                <GameCard
                  match={match}
                  position={game.position}
                  winnerTeamId={game.winnerTeamId}
                  lengthSeconds={game.lengthSeconds}
                  finished={game.finished}
                />
              </li>
            ))}
      </ul>

      <Recordings recordings={recordingsOf(detail.maps, bySlug)} />

      {detail.maps.length === 0 ? (
        <Text size="caption" tone="subtle">
          Названия карт и счёт по раундам для этого матча пока не опубликованы.
        </Text>
      ) : detail.source === null ? null : (
        <Text size="caption" tone="subtle">
          Карты, счёт по сторонам и записи —{" "}
          <a
            href={detail.source}
            target="_blank"
            rel="noreferrer noopener"
            className="underline decoration-border-strong underline-offset-2 transition-colors duration-150 hover:text-primary"
          >
            Liquipedia
          </a>
          . Изображения карт — PandaScore.
        </Text>
      )}
    </section>
  )
}
