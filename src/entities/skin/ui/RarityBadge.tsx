import { cn } from "@/shared/lib/style"

import { rarityTone } from "../lib/rarityTone"
import { RARITY_LABEL } from "../model/skin"
import type { SkinCategory, SkinRarity } from "../model/skin"

export type RarityBadgeProps = {
  rarity: SkinRarity
  category?: SkinCategory
  className?: string
}

export function RarityBadge({ rarity, category, className }: RarityBadgeProps) {
  const tone = rarityTone(rarity, category)

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-overline font-semibold uppercase",
        tone.text,
        className,
      )}
    >
      <span aria-hidden="true" className={cn("size-1.5 shrink-0 rounded-full", tone.bar)} />
      {RARITY_LABEL[rarity]}
    </span>
  )
}
