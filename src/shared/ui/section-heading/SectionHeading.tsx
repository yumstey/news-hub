import type { ReactNode } from "react"

import { cn } from "@/shared/lib/style"
import { Heading } from "@/shared/ui/typography"

export type SectionHeadingProps = {
  title: ReactNode
  action?: ReactNode
  level?: 2 | 3
  className?: string
}

export function SectionHeading({ title, action, level = 2, className }: SectionHeadingProps) {
  return (
    <div className={cn("flex items-center justify-between gap-4", className)}>
      <Heading level={level} size="subheading" className="flex items-center gap-2.5">
        <span aria-hidden="true" className="h-4 w-1 shrink-0 rounded-full bg-primary" />
        {title}
      </Heading>
      {action}
    </div>
  )
}
