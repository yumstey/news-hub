import Image from "next/image"

import { cn } from "@/shared/lib/style"

import type { GameMap } from "../model/gameMap"

export type MapImageProps = {
  map: GameMap | null
  /** Название из источника: показывается, когда карты нет в справочнике. */
  fallbackName: string
  dimmed?: boolean
  sizes?: string
  className?: string
}

export function MapImage({
  map,
  fallbackName,
  dimmed = false,
  sizes = "(min-width: 1024px) 22rem, (min-width: 640px) 50vw, 100vw",
  className,
}: MapImageProps) {
  const name = map?.name ?? fallbackName

  return (
    <span className={cn("relative block overflow-hidden bg-muted", className)}>
      {map?.image == null ? (
        <span
          aria-hidden="true"
          className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-elevated to-muted text-title font-bold text-border-strong"
        >
          {name.slice(0, 2).toUpperCase()}
        </span>
      ) : (
        <Image
          src={map.image}
          alt=""
          fill
          sizes={sizes}
          className={cn(
            "object-cover transition-[filter,opacity] duration-300",
            dimmed ? "opacity-40 grayscale" : "opacity-100",
          )}
        />
      )}

      <span
        aria-hidden="true"
        className="absolute inset-0 bg-linear-to-t from-black/80 via-black/25 to-transparent"
      />
    </span>
  )
}
