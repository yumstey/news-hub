import { Medal } from "lucide-react"

import { getEventPlacements } from "@/entities/tournament"
import { cn } from "@/shared/lib/style"
import { SectionHeading } from "@/shared/ui/section-heading"
import { Text } from "@/shared/ui/typography"

const USD = new Intl.NumberFormat("ru-RU", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
})

const MEDAL_TONE = ["text-warning", "text-subtle-foreground", "text-danger"]

export type EventPlacementsProps = {
  tournamentId: string
  name: string
  startsAt: Date
}

/**
 * Итоговые места с призовыми по командам: PandaScore отдаёт таблицу без денег,
 * Liquipedia — деньги без команд, поэтому берём связку с bo3.gg.
 */
export async function EventPlacements({ tournamentId, name, startsAt }: EventPlacementsProps) {
  const result = await getEventPlacements(tournamentId, name, startsAt.toISOString())

  if (!result.ok || result.data.length === 0) return null

  const rows = result.data
  const paid = rows.filter((row) => row.prizeUsd !== null).length

  if (paid === 0) return null

  return (
    <section className="flex flex-col gap-4">
      <SectionHeading title="Итоговые места" />

      <div className="overflow-hidden rounded-surface border border-border bg-surface">
        <ul className="divide-y divide-border">
          {rows.map((row, index) => (
            <li key={`${row.place}-${row.team}`} className="flex items-center gap-3 px-4 py-2.5">
              <span
                className={cn(
                  "w-14 shrink-0 text-caption font-bold tabular-nums",
                  index < 3 ? "text-foreground" : "text-subtle-foreground",
                )}
              >
                {row.place}
              </span>

              {index < 3 ? (
                <Medal aria-hidden="true" className={cn("size-4 shrink-0", MEDAL_TONE[index])} />
              ) : (
                <span aria-hidden="true" className="size-4 shrink-0" />
              )}


              <span className="min-w-0 flex-1 truncate text-caption font-semibold text-foreground">
                {row.team}
              </span>

              <span className="shrink-0 text-caption font-bold tabular-nums text-foreground">
                {row.prizeUsd === null ? "—" : USD.format(row.prizeUsd)}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <Text size="caption" tone="subtle">
        Призовые по местам —{" "}
        <a
          href="https://bo3.gg"
          target="_blank"
          rel="noopener noreferrer external"
          className="text-primary underline-offset-2 hover:underline"
        >
          bo3.gg
        </a>
        .
      </Text>
    </section>
  )
}
