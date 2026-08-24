import { Badge } from "@/shared/ui/badge"

import { MATCH_STATUS_LABEL } from "../model/match"
import type { MatchStatus } from "../model/match"

const variantByStatus: Record<MatchStatus, "live" | "neutral" | "outline" | "danger"> = {
  live: "live",
  scheduled: "outline",
  finished: "neutral",
  cancelled: "danger",
}

export type MatchStatusBadgeProps = {
  status: MatchStatus
  className?: string
}

export function MatchStatusBadge({ status, className }: MatchStatusBadgeProps) {
  return (
    <Badge
      variant={variantByStatus[status]}
      dot={status === "live"}
      pulse={status === "live"}
      className={className}
    >
      {MATCH_STATUS_LABEL[status]}
    </Badge>
  )
}
