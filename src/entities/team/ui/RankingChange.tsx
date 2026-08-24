import { cn } from "@/shared/lib/style"

export type RankingChangeProps = {
  change: number
  className?: string
}

export function RankingChange({ change, className }: RankingChangeProps) {
  if (change === 0) {
    return (
      <span className={cn("text-caption text-subtle-foreground", className)}>
        <span aria-hidden="true">—</span>
        <span className="sr-only">без изменений</span>
      </span>
    )
  }

  const up = change > 0

  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 text-caption font-semibold tabular-nums",
        up ? "text-success" : "text-danger",
        className,
      )}
    >
      <span aria-hidden="true">{up ? "▲" : "▼"}</span>
      {Math.abs(change)}
      <span className="sr-only">{up ? "позиций вверх" : "позиций вниз"}</span>
    </span>
  )
}
