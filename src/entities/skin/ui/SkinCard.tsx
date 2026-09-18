import Link from "next/link"

import { cn } from "@/shared/lib/style"

import { formatUsd } from "../lib/formatPrice"
import { rarityTone } from "../lib/rarityTone"
import { skinHref } from "../lib/skinHref"
import { RARITY_LABEL } from "../model/skin"
import type { SkinSummary } from "../model/skin"
import { ItemImage } from "./ItemImage"

export type SkinCardProps = {
  skin: SkinSummary
  eager?: boolean
  className?: string
}

export function SkinCard({ skin, eager = false, className }: SkinCardProps) {
  const tone = rarityTone(skin.rarity, skin.category)
  const title = skin.pattern ?? skin.name.replace(/^★\s*/, "")

  return (
    <Link
      href={skinHref(skin.slug)}
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-surface border border-border bg-surface",
        "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-surface",
        tone.border,
        className,
      )}
    >
      <span aria-hidden="true" className={cn("absolute inset-x-0 top-0 h-0.5", tone.bar)} />

      <ItemImage
        src={skin.image}
        alt={skin.name}
        glow={tone.glow}
        eager={eager}
        sizes="(min-width: 1280px) 14rem, (min-width: 640px) 33vw, 50vw"
        className="aspect-[4/3] w-full bg-elevated"
        imageClassName="transition-transform duration-300 group-hover:scale-105"
      />

      <span className="flex flex-1 flex-col gap-1 p-3">
        <span className="truncate text-overline uppercase text-subtle-foreground">
          {skin.weapon}
          {skin.phase === null ? null : ` · ${skin.phase}`}
        </span>
        <span className="line-clamp-2 text-sm font-semibold leading-snug text-foreground">
          {title}
        </span>

        <span className="mt-auto flex items-end justify-between gap-2 pt-2">
          <span className={cn("truncate text-overline uppercase", tone.text)}>
            {RARITY_LABEL[skin.rarity]}
          </span>
          <span className="shrink-0 text-right">
            {skin.fromPrice === null ? (
              <span className="text-caption text-subtle-foreground">нет в продаже</span>
            ) : (
              <>
                <span className="block text-overline uppercase text-subtle-foreground">от</span>
                <span className="text-sm font-bold tabular-nums text-foreground">
                  {formatUsd(skin.fromPrice)}
                </span>
              </>
            )}
          </span>
        </span>
      </span>
    </Link>
  )
}

export function SkinGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {Array.from({ length: count }, (_, index) => (
        <li key={index} className="h-64 rounded-surface border border-border bg-skeleton" />
      ))}
    </ul>
  )
}
