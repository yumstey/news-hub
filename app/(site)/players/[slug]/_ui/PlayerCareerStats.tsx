import { getPlayerCareerStats } from "@/entities/player"
import { SectionHeading } from "@/shared/ui/section-heading"
import { Text } from "@/shared/ui/typography"

const NUMBER = new Intl.NumberFormat("ru-RU")

function Stat({ value, label, hint }: { value: string; label: string; hint?: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-control border border-border bg-elevated/50 px-4 py-3">
      <span className="text-heading font-bold tabular-nums text-foreground">{value}</span>
      <span className="text-caption text-muted-foreground">{label}</span>
      {hint === undefined ? null : (
        <span className="text-overline tracking-normal text-subtle-foreground">{hint}</span>
      )}
    </div>
  )
}

export type PlayerCareerStatsProps = {
  slug: string
  nickname: string
}

/**
 * Карьерная статистика игрока: рейтинг, K/D, урон и клатчи. Матчевый тариф
 * PandaScore таких данных не отдаёт, поэтому цифры берём из открытого bo3.gg.
 */
export async function PlayerCareerStats({ slug, nickname }: PlayerCareerStatsProps) {
  const result = await getPlayerCareerStats(slug, nickname)

  if (!result.ok || result.data === null) return null

  const stats = result.data

  return (
    <section className="flex flex-col gap-4">
      <SectionHeading title="Статистика карьеры" />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <Stat value={stats.rating.toFixed(2)} label="Рейтинг bo3.gg" hint="шкала 0–10" />
        <Stat value={stats.kd.toFixed(2)} label="K/D" />
        <Stat value={stats.adr.toFixed(1)} label="Урон за раунд" />
        <Stat
          value={`${Math.round(stats.headshotShare * 100)}%`}
          label="Попаданий в голову"
        />
        <Stat value={stats.killsPerRound.toFixed(2)} label="Убийств за раунд" />
        <Stat value={stats.firstKillsPerRound.toFixed(2)} label="Первых убийств" hint="за раунд" />
        <Stat value={NUMBER.format(stats.clutches)} label="Клатчей выиграно" />
        <Stat
          value={`${Math.round(stats.roundWinrate * 100)}%`}
          label="Выигранных раундов"
          hint={`${NUMBER.format(stats.games)} карт · ${NUMBER.format(stats.rounds)} раундов`}
        />
      </div>

      <Text size="caption" tone="subtle">
        Статистика карьеры —{" "}
        <a
          href={stats.source}
          target="_blank"
          rel="noopener noreferrer external"
          className="text-primary underline-offset-2 hover:underline"
        >
          bo3.gg
        </a>
        . Данные собраны по официальным матчам и обновляются после турниров.
      </Text>
    </section>
  )
}
