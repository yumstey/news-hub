import { MapImage, toMapSlug } from "@/entities/game-map"
import type { GameMap, TeamMapPool as Pool, TeamMapRecord } from "@/entities/game-map"
import { cn } from "@/shared/lib/style"
import { pluralize } from "@/shared/lib/text"
import { SectionHeading } from "@/shared/ui/section-heading"
import { Text } from "@/shared/ui/typography"

function winrate(record: TeamMapRecord): number {
  const total = record.wins + record.losses

  return total === 0 ? 0 : Math.round((record.wins / total) * 100)
}

function MapRow({ record, map }: { record: TeamMapRecord; map: GameMap | null }) {
  const rate = winrate(record)
  const diff = record.roundsWon - record.roundsLost

  return (
    <li className="flex items-center gap-3 rounded-control border border-border bg-surface p-2">
      <MapImage
        map={map}
        fallbackName={record.name}
        sizes="6rem"
        className="h-12 w-20 shrink-0 rounded-xs"
      />

      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="flex items-baseline justify-between gap-2">
          <span className="truncate text-caption font-semibold uppercase text-foreground">
            {map?.name ?? record.name}
          </span>
          <span className="shrink-0 text-caption tabular-nums">
            <span className="font-semibold text-success">{record.wins}</span>
            <span className="mx-0.5 text-subtle-foreground">—</span>
            <span className="font-semibold text-danger">{record.losses}</span>
          </span>
        </span>

        <svg
          viewBox="0 0 100 4"
          preserveAspectRatio="none"
          aria-hidden="true"
          className="h-1 w-full overflow-hidden rounded-full"
        >
          <rect x="0" y="0" width="100" height="4" className="fill-danger-soft" />
          <rect x="0" y="0" width={rate} height="4" className="fill-success" />
        </svg>

        <span className="flex items-center justify-between gap-2 text-overline uppercase text-subtle-foreground">
          <span className={cn(rate >= 50 ? "text-success" : "text-danger")}>{rate}% побед</span>
          <span className="tabular-nums">
            раунды {record.roundsWon}:{record.roundsLost}
            <span className={cn("ml-1", diff >= 0 ? "text-success" : "text-danger")}>
              {diff >= 0 ? "+" : ""}
              {diff}
            </span>
          </span>
        </span>
      </span>
    </li>
  )
}

export type TeamMapPoolProps = {
  pool: Pool
  catalogue: readonly GameMap[]
  className?: string
}

export function TeamMapPool({ pool, catalogue, className }: TeamMapPoolProps) {
  if (pool.maps.length === 0) return null

  const bySlug = new Map(catalogue.map((entry) => [entry.slug, entry]))

  return (
    <section className={cn("flex flex-col gap-4", className)}>
      <SectionHeading
        title="Карты команды"
        action={
          <span className="text-caption text-subtle-foreground">
            по {pluralize(pool.events, ["турниру", "турнирам", "турнирам"])}
          </span>
        }
      />

      <ul className="grid gap-2 sm:grid-cols-2">
        {pool.maps.map((record) => (
          <MapRow
            key={record.name}
            record={record}
            map={bySlug.get(toMapSlug(record.name)) ?? null}
          />
        ))}
      </ul>

      <Text size="caption" tone="subtle">
        Результаты по картам собраны с Liquipedia за последние турниры команды. Изображения карт
        — PandaScore.
      </Text>
    </section>
  )
}
