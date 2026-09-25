import type { Bo3MapScore, Bo3MatchDetail, Bo3PlayerStat, MatchSide } from "@/entities/match"
import { cn } from "@/shared/lib/style"
import { SectionHeading } from "@/shared/ui/section-heading"
import { Text } from "@/shared/ui/typography"

const ACTION_LABEL: Record<Bo3MatchDetail["veto"][number]["action"], string> = {
  ban: "бан",
  pick: "пик",
  decider: "решающая",
}

const ACTION_TONE: Record<Bo3MatchDetail["veto"][number]["action"], string> = {
  ban: "border-danger/40 text-danger",
  pick: "border-primary/40 text-primary",
  decider: "border-warning/40 text-warning",
}

/** «de_dust2» → «Dust2»: источник пишет системные имена карт. */
function mapLabel(name: string): string {
  const base = name.replace(/^de[_-]/, "").replace(/[_-]+/g, " ").trim()

  return base.length === 0 ? name : base.slice(0, 1).toUpperCase() + base.slice(1)
}

function ratingTone(rating: number): string {
  if (rating >= 6.5) return "text-success"
  if (rating < 5) return "text-danger"

  return "text-foreground"
}

function Veto({ steps }: { steps: Bo3MatchDetail["veto"] }) {
  if (steps.length === 0) return null

  return (
    <div className="flex flex-col gap-2">
      <span className="text-overline uppercase tracking-wider text-subtle-foreground">
        Выбор карт
      </span>
      <ol className="flex flex-wrap gap-2">
        {steps.map((step) => (
          <li
            key={step.order}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-control border bg-surface px-2.5 py-1 text-caption",
              ACTION_TONE[step.action],
            )}
          >
            <span className="font-semibold">{step.map ?? "—"}</span>
            <span className="text-subtle-foreground">
              {ACTION_LABEL[step.action]}
              {step.team === null ? "" : ` · ${step.team}`}
            </span>
          </li>
        ))}
      </ol>
    </div>
  )
}

function Scoreboard({ players, teamName }: { players: readonly Bo3PlayerStat[]; teamName: string }) {
  const rows = [...players].sort((left, right) => right.rating - left.rating)

  if (rows.length === 0) return null

  return (
    <>
      <tr className="bg-elevated/60">
        <th
          scope="colgroup"
          colSpan={7}
          className="px-3 py-1.5 text-left text-overline uppercase tracking-wider text-muted-foreground"
        >
          {teamName}
        </th>
      </tr>
      {rows.map((player) => (
        <tr key={`${teamName}-${player.nickname}`} className="border-b border-border last:border-0">
          <td className="px-3 py-2 text-sm font-semibold text-foreground">{player.nickname}</td>
          <td className="px-2 py-2 text-right tabular-nums text-foreground">{player.kills}</td>
          <td className="px-2 py-2 text-right tabular-nums text-muted-foreground">{player.deaths}</td>
          <td className="px-2 py-2 text-right tabular-nums text-muted-foreground">{player.assists}</td>
          <td className="px-2 py-2 text-right tabular-nums text-muted-foreground">
            {player.adr.toFixed(1)}
          </td>
          <td className="px-2 py-2 text-right tabular-nums text-muted-foreground">
            {Math.round(player.kast * 100)}%
          </td>
          <td className={cn("px-3 py-2 text-right font-bold tabular-nums", ratingTone(player.rating))}>
            {player.rating.toFixed(2)}
          </td>
        </tr>
      ))}
    </>
  )
}

function MapBlock({
  map,
  teams,
}: {
  map: Bo3MapScore
  teams: readonly [MatchSide, MatchSide]
}) {
  const [first, second] = teams
  const firstWon = map.firstScore > map.secondScore
  const byTeam = new Map<string, Bo3PlayerStat[]>()

  for (const player of map.players) {
    const bucket = byTeam.get(player.teamName) ?? []

    bucket.push(player)
    byTeam.set(player.teamName, bucket)
  }

  const [firstGroup, secondGroup] = [...byTeam.values()]

  return (
    <article className="overflow-hidden rounded-surface border border-border bg-surface">
      <header className="flex items-center justify-between gap-3 border-b border-border bg-elevated/60 px-4 py-2.5">
        <span className="flex items-center gap-2">
          <span className="text-caption font-bold uppercase tracking-wider text-subtle-foreground">
            Карта {map.order}
          </span>
          <span className="text-sm font-bold text-foreground">{mapLabel(map.map)}</span>
        </span>
        <span className="flex items-center gap-1.5 text-sm font-bold tabular-nums">
          <span className={firstWon ? "text-success" : "text-subtle-foreground"}>{map.firstScore}</span>
          <span className="text-subtle-foreground">:</span>
          <span className={firstWon ? "text-subtle-foreground" : "text-success"}>{map.secondScore}</span>
        </span>
      </header>

      <div className="overflow-x-auto">
        <table className="w-full min-w-140 border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-overline uppercase text-subtle-foreground">
              <th scope="col" className="px-3 py-2 text-left font-semibold">
                Игрок
              </th>
              <th scope="col" className="px-2 py-2 text-right font-semibold">K</th>
              <th scope="col" className="px-2 py-2 text-right font-semibold">D</th>
              <th scope="col" className="px-2 py-2 text-right font-semibold">A</th>
              <th scope="col" className="px-2 py-2 text-right font-semibold">ADR</th>
              <th scope="col" className="px-2 py-2 text-right font-semibold">KAST</th>
              <th scope="col" className="px-3 py-2 text-right font-semibold">Рейтинг</th>
            </tr>
          </thead>
          <tbody>
            <Scoreboard players={firstGroup ?? []} teamName={first.team.name} />
            <Scoreboard players={secondGroup ?? []} teamName={second.team.name} />
          </tbody>
        </table>
      </div>
    </article>
  )
}

export type MatchStatsBoardProps = {
  detail: Bo3MatchDetail
  teams: readonly [MatchSide, MatchSide]
}

/**
 * Подробная статистика матча: выбор карт и покарточные таблицы игроков.
 * Матчевый тариф PandaScore таких данных не отдаёт — цифры берём с bo3.gg.
 */
export function MatchStatsBoard({ detail, teams }: MatchStatsBoardProps) {
  if (detail.maps.length === 0 && detail.veto.length === 0) return null

  return (
    <section className="flex flex-col gap-4">
      <SectionHeading title="Статистика матча" />

      <Veto steps={detail.veto} />

      <div className="flex flex-col gap-4">
        {detail.maps.map((map) => (
          <MapBlock key={`${map.order}-${map.map}`} map={map} teams={teams} />
        ))}
      </div>

      <Text size="caption" tone="subtle">
        Покарточная статистика и выбор карт —{" "}
        <a
          href={detail.source}
          target="_blank"
          rel="noopener noreferrer external"
          className="text-primary underline-offset-2 hover:underline"
        >
          bo3.gg
        </a>
        . Рейтинг игрока приведён по шкале 0–10.
      </Text>
    </section>
  )
}
