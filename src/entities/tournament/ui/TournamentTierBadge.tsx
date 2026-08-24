import { Badge } from "@/shared/ui/badge"

import { TOURNAMENT_TIER_LABEL } from "../model/tournament"
import type { TournamentTier } from "../model/tournament"

const variantByTier: Record<TournamentTier, "primary" | "soft" | "neutral" | "outline"> = {
  s: "primary",
  a: "soft",
  b: "neutral",
  c: "outline",
}

export type TournamentTierBadgeProps = {
  tier: TournamentTier
  className?: string
}

export function TournamentTierBadge({ tier, className }: TournamentTierBadgeProps) {
  return (
    <Badge variant={variantByTier[tier]} className={className}>
      {TOURNAMENT_TIER_LABEL[tier]}
    </Badge>
  )
}
