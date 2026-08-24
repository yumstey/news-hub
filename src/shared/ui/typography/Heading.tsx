import type { HTMLAttributes } from "react"

import { cn } from "@/shared/lib/style"

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6
export type HeadingSize = "display" | "title" | "heading" | "subheading"
export type HeadingTone = "default" | "muted" | "primary" | "inverted"

const sizeClasses: Record<HeadingSize, string> = {
  display: "text-display",
  title: "text-title",
  heading: "text-heading",
  subheading: "text-subheading",
}

const toneClasses: Record<HeadingTone, string> = {
  default: "text-foreground",
  muted: "text-muted-foreground",
  primary: "text-primary",
  inverted: "text-primary-foreground",
}

const sizeByLevel: Record<HeadingLevel, HeadingSize> = {
  1: "display",
  2: "title",
  3: "heading",
  4: "subheading",
  5: "subheading",
  6: "subheading",
}

export type HeadingProps = HTMLAttributes<HTMLHeadingElement> & {
  level?: HeadingLevel
  size?: HeadingSize
  tone?: HeadingTone
}

export function Heading({
  level = 2,
  size,
  tone = "default",
  className,
  children,
  ...rest
}: HeadingProps) {
  const Tag = `h${level}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6"

  return (
    <Tag
      className={cn(sizeClasses[size ?? sizeByLevel[level]], toneClasses[tone], className)}
      {...rest}
    >
      {children}
    </Tag>
  )
}
