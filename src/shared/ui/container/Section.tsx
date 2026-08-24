import type { HTMLAttributes } from "react"

import { cn } from "@/shared/lib/style"

export type SectionElement = "section" | "div" | "article" | "aside"
export type SectionSpacing = "none" | "sm" | "md" | "lg"

const spacingClasses: Record<SectionSpacing, string> = {
  none: "",
  sm: "py-8",
  md: "py-section",
  lg: "py-section lg:py-section-lg",
}

export type SectionProps = HTMLAttributes<HTMLElement> & {
  as?: SectionElement
  spacing?: SectionSpacing
}

export function Section({
  as = "section",
  spacing = "md",
  className,
  children,
  ...rest
}: SectionProps) {
  const Tag = as

  return (
    <Tag className={cn(spacingClasses[spacing], className)} {...rest}>
      {children}
    </Tag>
  )
}
