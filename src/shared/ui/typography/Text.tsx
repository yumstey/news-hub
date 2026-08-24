import type { HTMLAttributes } from "react"

import { cn } from "@/shared/lib/style"

export type TextElement = "p" | "span" | "div"
export type TextSize = "lead" | "body" | "caption" | "overline"
export type TextWeight = "normal" | "medium" | "semibold" | "bold"
export type TextTone =
  | "default"
  | "muted"
  | "subtle"
  | "primary"
  | "inverted"
  | "live"
  | "success"
  | "warning"
  | "danger"

const sizeClasses: Record<TextSize, string> = {
  lead: "text-lead",
  body: "text-body",
  caption: "text-caption",
  overline: "text-overline uppercase",
}

const toneClasses: Record<TextTone, string> = {
  default: "text-foreground",
  muted: "text-muted-foreground",
  subtle: "text-subtle-foreground",
  primary: "text-primary",
  inverted: "text-primary-foreground",
  live: "text-live",
  success: "text-success",
  warning: "text-warning",
  danger: "text-danger",
}

const weightClasses: Record<TextWeight, string> = {
  normal: "font-normal",
  medium: "font-medium",
  semibold: "font-semibold",
  bold: "font-bold",
}

const clampClasses: Record<1 | 2 | 3 | 4, string> = {
  1: "line-clamp-1",
  2: "line-clamp-2",
  3: "line-clamp-3",
  4: "line-clamp-4",
}

export type TextProps = HTMLAttributes<HTMLElement> & {
  as?: TextElement
  size?: TextSize
  tone?: TextTone
  weight?: TextWeight
  clamp?: 1 | 2 | 3 | 4
}

export function Text({
  as = "p",
  size = "body",
  tone = "default",
  weight = "normal",
  clamp,
  className,
  children,
  ...rest
}: TextProps) {
  const Tag = as

  return (
    <Tag
      className={cn(
        sizeClasses[size],
        toneClasses[tone],
        weightClasses[weight],
        clamp ? clampClasses[clamp] : undefined,
        className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  )
}
