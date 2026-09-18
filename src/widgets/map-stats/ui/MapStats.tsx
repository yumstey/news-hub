import { MapImage, toMapSlug } from "@/entities/game-map"
import type { EventMapStats, GameMap, MapUsage } from "@/entities/game-map"
import { cn } from "@/shared/lib/style"
import { pluralize } from "@/shared/lib/text"
import { SectionHeading } from "@/shared/ui/section-heading"
import { Text } from "@/shared/ui/typography"

function share(usage: MapUsage): number | null {
  const total = usage.ctRounds + usage.tRounds

  return total === 0 ? null : Math.round((usage.ctRounds / total) * 100)
}

function MapTile({ usage, map, peak }: { usage: MapUsage; map: GameMap | null; peak: number }) {
  const ctShare = share(usage)
  const width = peak === 0 ? 0 : Math.round((usage.played / peak) * 100)

  return (
    <li className="flex flex-col overflow-hidden rounded-surface border border-border bg-surface">
      <div className="relative aspect-16/7 w-full">
        <MapImage
          map={map}
          fallbackName={usage.name}
          dimmed={usage.played === 0}
          sizes="(min-width: 1024px) 16rem, (min-width: 640px) 33vw, 100vw"
          className="absolute inset-0 size-full"
        />
        <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-2.5">
          <span className="text-caption font-bold uppercase tracking-wide text-white drop-shadow">
            {map?.name ?? usage.name}
          </span>
          <span className="text-sm font-bold tabular-nums text-white drop-shadow">
            {usage.played}
          </span>
        </span>
      </div>

      <div className="flex flex-col gap-2 p-3">
        <svg
          viewBox="0 0 100 4"
          preserveAspectRatio="none"
          aria-hidden="true"
          className="h-1 w-full overflow-hidden rounded-full"
        >
          <rect x="0" y="0" width="100" height="4" className="fill-muted" />
          <rect x="0" y="0" width={width} height="4" className="fill-primary" />
        </svg>

        <div className="flex items-center justify-between gap-2 text-overline uppercase">
          {ctShare === null ? (
            <span className="text-subtle-foreground">нет данных по сторонам</span>
          ) : (
            <>
              <span className="text-primary">CT {ctShare}%</span>
              <span className="text-warning">T {100 - ctShare}%</span>
            </>
          )}
        </div>

        {usage.skipped === 0 ? null : (
          <span className="text-overline uppercase text-subtle-foreground">
            {pluralize(usage.skipped, ["раз", "раза", "раз"])} оставалась решающей
          </span>
        )}
      </div>
    </li>
  )
}

export type MapStatsProps = {
  stats: EventMapStats
  catalogue: readonly GameMap[]
  className?: string
}

export function MapStats({ stats, catalogue, className }: MapStatsProps) {
  const playable = stats.maps.filter((usage) => usage.played > 0)

  if (playable.length === 0) return null

  const bySlug = new Map(catalogue.map((entry) => [entry.slug, entry]))
  const peak = Math.max(...playable.map((usage) => usage.played))

  return (
    <section className={cn("flex flex-col gap-4", className)}>
      <SectionHeading
        title="Карты турнира"
        action={
          <span className="text-caption text-subtle-foreground">
            {pluralize(stats.matches, ["матч", "матча", "матчей"])}
          </span>
        }
      />

      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {playable.map((usage) => (
          <MapTile
            key={usage.name}
            usage={usage}
            map={bySlug.get(toMapSlug(usage.name)) ?? null}
            peak={peak}
          />
        ))}
      </ul>

      {stats.source === null ? null : (
        <Text size="caption" tone="subtle">
          Число сыгранных карт и доля раундов за стороны —{" "}
          <a
            href={stats.source}
            target="_blank"
            rel="noreferrer noopener"
            className="underline decoration-border-strong underline-offset-2 transition-colors duration-150 hover:text-primary"
          >
            Liquipedia
          </a>
          . Изображения — PandaScore.
        </Text>
      )}
    </section>
  )
}
