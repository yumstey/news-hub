import { cn } from "@/shared/lib/style"

import type { MatchOutcome } from "../model/team"

export type TeamFormProps = {
  form: readonly MatchOutcome[]
  className?: string
}

export function TeamForm({ form, className }: TeamFormProps) {
  if (form.length === 0) return null

  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      {form.map((outcome, index) => (
        <span
          key={`${outcome}-${index}`}
          title={outcome === "win" ? "Победа" : "Поражение"}
          className={cn(
            "inline-flex size-5 items-center justify-center rounded-xs text-[0.625rem] font-bold uppercase leading-none",
            outcome === "win"
              ? "bg-success-soft text-success"
              : "bg-danger-soft text-danger",
          )}
        >
          {outcome === "win" ? "W" : "L"}
        </span>
      ))}
    </span>
  )
}
