import type { ReactNode } from "react"

import { cn } from "@/shared/lib/style"

export type HeroStatProps = {
  value: ReactNode
  label: string
  icon?: ReactNode
  /** Красная пульсирующая точка для счётчиков «в эфире». */
  live?: boolean
  className?: string
}

/** Счётчик в баннере раздела: крупное число и подпись. */
export function HeroStat({ value, label, icon, live = false, className }: HeroStatProps) {
  return (
    <div
      className={cn(
        "inline-flex h-11 items-center gap-2.5 rounded-control border border-border bg-background/60 px-3.5 backdrop-blur-sm",
        className,
      )}
    >
      {live ? (
        <span className="relative flex size-2.5" aria-hidden="true">
          <span className="absolute inline-flex size-full animate-live-ping rounded-full bg-live" />
          <span className="relative inline-flex size-2.5 rounded-full bg-live" />
        </span>
      ) : null}
      {icon}
      <span className="flex items-baseline gap-1.5">
        <span className="text-sm font-bold tabular-nums text-foreground">{value}</span>
        <span className="text-caption text-muted-foreground">{label}</span>
      </span>
    </div>
  )
}
