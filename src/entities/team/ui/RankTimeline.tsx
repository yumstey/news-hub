import { formatDate } from "@/shared/lib/date"
import { cn } from "@/shared/lib/style"

import type { RankPoint } from "../api/getRankingHistory"

const WIDTH = 320
const HEIGHT = 110
const PAD_X = 8
const PAD_TOP = 14
const PAD_BOTTOM = 18

export type RankTimelineProps = {
  points: readonly RankPoint[]
  teamName: string
  className?: string
}

export function RankTimeline({ points, teamName, className }: RankTimelineProps) {
  if (points.length < 2) return null

  const ranks = points.map((point) => point.rank)
  const best = Math.min(...ranks)
  const worst = Math.max(...ranks)
  const span = Math.max(1, worst - best)

  const x = (index: number): number =>
    PAD_X + (index * (WIDTH - PAD_X * 2)) / (points.length - 1)

  const y = (rank: number): number =>
    PAD_TOP + ((rank - best) * (HEIGHT - PAD_TOP - PAD_BOTTOM)) / span

  const line = points.map((point, index) => `${x(index)},${y(point.rank)}`).join(" ")
  const area = `${PAD_X},${HEIGHT - PAD_BOTTOM} ${line} ${WIDTH - PAD_X},${HEIGHT - PAD_BOTTOM}`

  const first = points[0]
  const last = points[points.length - 1]
  const bestPoint = points.find((point) => point.rank === best)

  if (first === undefined || last === undefined || bestPoint === undefined) return null

  const trend = first.rank - last.rank

  return (
    <figure className={cn("flex flex-col gap-2", className)}>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label={`Динамика места ${teamName} в мировом рейтинге Valve: с ${first.rank} на ${last.rank}`}
        className="h-auto w-full text-primary"
      >
        <defs>
          <linearGradient id="rank-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.18" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>

        <line
          x1={PAD_X}
          y1={y(best)}
          x2={WIDTH - PAD_X}
          y2={y(best)}
          className="stroke-border"
          strokeWidth="1"
          strokeDasharray="3 4"
        />

        <polygon points={area} fill="url(#rank-fill)" />

        <polyline
          points={line}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {points.map((point, index) => (
          <g key={point.date.toISOString()}>
            <circle
              cx={x(index)}
              cy={y(point.rank)}
              r="8"
              fill="transparent"
              className="pointer-events-auto"
            >
              <title>{`${formatDate(point.date)} — #${point.rank}, ${point.points} очков`}</title>
            </circle>
            <circle
              cx={x(index)}
              cy={y(point.rank)}
              r={point === last ? 4 : 2.5}
              fill="currentColor"
              className={point === last ? "stroke-surface" : undefined}
              strokeWidth={point === last ? 2 : 0}
            />
          </g>
        ))}

        <text
          x={PAD_X}
          y={HEIGHT - 4}
          className="fill-subtle-foreground text-[9px] tabular-nums"
        >
          {formatDate(first.date)}
        </text>
        <text
          x={WIDTH - PAD_X}
          y={HEIGHT - 4}
          textAnchor="end"
          className="fill-subtle-foreground text-[9px] tabular-nums"
        >
          {formatDate(last.date)}
        </text>
        <text
          x={x(points.indexOf(bestPoint))}
          y={y(best) - 6}
          textAnchor="middle"
          className="fill-muted-foreground text-[9px] font-semibold tabular-nums"
        >
          #{best}
        </text>
      </svg>

      <figcaption className="flex flex-wrap items-center gap-2 text-caption text-muted-foreground">
        <span className="tabular-nums">
          #{first.rank} → #{last.rank}
        </span>
        {trend === 0 ? null : (
          <span
            className={cn(
              "font-semibold tabular-nums",
              trend > 0 ? "text-success" : "text-danger",
            )}
          >
            {trend > 0 ? "▲" : "▼"} {Math.abs(trend)}
          </span>
        )}
        <span>за {points.length} обновлений</span>
      </figcaption>

      <table className="sr-only">
        <caption>{`Место ${teamName} в мировом рейтинге Valve`}</caption>
        <thead>
          <tr>
            <th scope="col">Дата</th>
            <th scope="col">Место</th>
            <th scope="col">Очки</th>
          </tr>
        </thead>
        <tbody>
          {points.map((point) => (
            <tr key={point.date.toISOString()}>
              <td>{formatDate(point.date)}</td>
              <td>{point.rank}</td>
              <td>{point.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  )
}
