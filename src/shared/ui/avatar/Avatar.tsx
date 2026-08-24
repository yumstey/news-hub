import Image from "next/image"
import type { HTMLAttributes } from "react"

import { cn } from "@/shared/lib/style"

export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl"
export type AvatarShape = "circle" | "rounded"

const sizePx: Record<AvatarSize, number> = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 56,
  xl: 80,
}

const sizeClasses: Record<AvatarSize, string> = {
  xs: "size-6 text-overline",
  sm: "size-8 text-overline",
  md: "size-10 text-caption",
  lg: "size-14 text-base",
  xl: "size-20 text-lead",
}

const shapeClasses: Record<AvatarShape, string> = {
  circle: "rounded-full",
  rounded: "rounded-control",
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2)
  if (parts.length === 0) return "?"

  return parts.map((part) => part.charAt(0).toUpperCase()).join("")
}

export type AvatarProps = Omit<HTMLAttributes<HTMLSpanElement>, "children"> & {
  name: string
  src?: string | null
  size?: AvatarSize
  shape?: AvatarShape
  ring?: boolean
}

export function Avatar({
  name,
  src,
  size = "md",
  shape = "circle",
  ring = false,
  className,
  ...rest
}: AvatarProps) {
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 select-none items-center justify-center overflow-hidden bg-muted font-semibold text-muted-foreground",
        sizeClasses[size],
        shapeClasses[shape],
        ring ? "ring-2 ring-border ring-offset-2 ring-offset-background" : undefined,
        className,
      )}
      {...rest}
    >
      {src ? (
        <Image
          src={src}
          alt={name}
          width={sizePx[size]}
          height={sizePx[size]}
          className="size-full object-cover"
        />
      ) : (
        <span aria-hidden="true">{initialsOf(name)}</span>
      )}
      {src ? null : <span className="sr-only">{name}</span>}
    </span>
  )
}
