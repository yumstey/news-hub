import { WEAR_FLOAT, WEAR_LABEL, WEAR_ORDER, WEAR_SHORT } from "@/entities/skin"
import type { SkinWear } from "@/entities/skin"
import { cn } from "@/shared/lib/style"

const WEAR_FILL: Record<SkinWear, string> = {
  fn: "fill-success",
  mw: "fill-success/70",
  ft: "fill-warning",
  ww: "fill-danger/70",
  bs: "fill-danger",
}

export type FloatRangeProps = {
  min: number | null
  max: number | null
  className?: string
}

/**
 * Шкала износа 0–1 с отметкой возможного диапазона float: сразу видно,
 * бывает ли скин «Прямо с завода» и в каком износе его искать.
 */
export function FloatRange({ min, max, className }: FloatRangeProps) {
  if (min === null || max === null) return null

  const from = min * 100
  const to = max * 100

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-overline uppercase text-subtle-foreground">Диапазон float</span>
        <span className="text-caption font-semibold tabular-nums text-foreground">
          {min.toFixed(2)} — {max.toFixed(2)}
        </span>
      </div>

      <svg viewBox="0 0 100 12" preserveAspectRatio="none" aria-hidden="true" className="h-3 w-full">
        {WEAR_ORDER.map((wear) => {
          const [start, end] = WEAR_FLOAT[wear]

          return (
            <rect
              key={wear}
              x={start * 100}
              y="3"
              width={(end - start) * 100}
              height="6"
              className={cn(WEAR_FILL[wear], "opacity-35")}
            />
          )
        })}
        <rect x={from} y="1" width={Math.max(to - from, 0.6)} height="10" rx="1" className="fill-foreground/85" />
      </svg>

      <ul className="grid grid-cols-5 gap-1 text-center">
        {WEAR_ORDER.map((wear) => {
          const [start, end] = WEAR_FLOAT[wear]
          const possible = end > min && start < max

          return (
            <li
              key={wear}
              title={WEAR_LABEL[wear]}
              className={cn(
                "rounded-xs py-0.5 text-overline font-semibold",
                possible ? "bg-muted text-foreground" : "text-subtle-foreground line-through opacity-60",
              )}
            >
              {WEAR_SHORT[wear]}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
