import { Radio, Users } from "lucide-react"
import Link from "next/link"

import { getOnlinePlayers } from "@/entities/game-update"
import { getLiveCount } from "@/entities/match"
import { ROUTES } from "@/shared/config"
import { cn } from "@/shared/lib/style"
import { plural } from "@/shared/lib/text"

const CHIP =
  "inline-flex h-11 items-center gap-2.5 rounded-control border border-border bg-background/60 px-3.5 backdrop-blur-sm"

function Pulse({ tone }: { tone: "success" | "live" }) {
  return (
    <span className="relative flex size-2.5" aria-hidden="true">
      <span
        className={cn(
          "absolute inline-flex size-full animate-live-ping rounded-full",
          tone === "success" ? "bg-success" : "bg-live",
        )}
      />
      <span className={cn("relative inline-flex size-2.5 rounded-full", tone === "success" ? "bg-success" : "bg-live")} />
    </span>
  )
}

/** Сколько человек сейчас в игре — по данным Steam. */
export async function OnlineNow({ className }: { className?: string }) {
  const result = await getOnlinePlayers()

  if (!result.ok) return null

  return (
    <div className={cn(CHIP, className)}>
      <Pulse tone="success" />
      <Users aria-hidden="true" className="size-4 text-subtle-foreground" />
      <span className="flex items-baseline gap-1.5">
        <span className="text-sm font-bold tabular-nums text-foreground">
          {result.data.count.toLocaleString("ru-RU")}
        </span>
        <span className="text-caption text-muted-foreground">в игре сейчас</span>
      </span>
    </div>
  )
}

/** Сколько матчей идёт прямо сейчас — ведёт в расписание. */
export async function LiveNow({ className }: { className?: string }) {
  const count = await getLiveCount()

  if (count === 0) return null

  return (
    <Link
      href={ROUTES.matches}
      className={cn(CHIP, "transition-colors duration-150 hover:border-live/60", className)}
    >
      <Pulse tone="live" />
      <Radio aria-hidden="true" className="size-4 text-live" />
      <span className="flex items-baseline gap-1.5">
        <span className="text-sm font-bold tabular-nums text-foreground">{count}</span>
        <span className="text-caption text-muted-foreground">
          {plural(count, ["матч", "матча", "матчей"])} в эфире
        </span>
      </span>
    </Link>
  )
}