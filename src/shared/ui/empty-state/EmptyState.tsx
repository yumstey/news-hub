import type { ReactNode } from "react"

import { cn } from "@/shared/lib/style"
import { Heading, Text } from "@/shared/ui/typography"

export type EmptyStateTone = "muted" | "danger"

const toneClasses: Record<EmptyStateTone, string> = {
  muted: "border-border bg-muted",
  danger: "border-danger/40 bg-danger-soft",
}

export type EmptyStateProps = {
  title: string
  description?: string
  action?: ReactNode
  tone?: EmptyStateTone
  className?: string
}

export function EmptyState({
  title,
  description,
  action,
  tone = "muted",
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-start gap-3 rounded-surface border p-6",
        toneClasses[tone],
        className,
      )}
    >
      <Heading level={3} size="subheading">
        {title}
      </Heading>
      {description ? (
        <Text size="caption" tone="muted">
          {description}
        </Text>
      ) : null}
      {action}
    </div>
  )
}
