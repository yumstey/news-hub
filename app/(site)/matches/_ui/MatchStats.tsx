import { CalendarDays, Radio, Trophy } from "lucide-react"

import { getScheduleSummary } from "@/entities/match"
import { plural } from "@/shared/lib/text"
import { HeroStat } from "@/widgets/game-hub"

/** Счётчики раздела: сколько идёт сейчас, сколько сегодня и на скольких турнирах. */
export async function MatchStats() {
  const summary = await getScheduleSummary()

  return (
    <>
      {summary.live === 0 ? null : (
        <HeroStat
          live
          icon={<Radio aria-hidden="true" className="size-4 text-live" />}
          value={summary.live}
          label={`${plural(summary.live, ["матч", "матча", "матчей"])} в эфире`}
        />
      )}
      <HeroStat
        icon={<CalendarDays aria-hidden="true" className="size-4 text-subtle-foreground" />}
        value={summary.today}
        label={`${plural(summary.today, ["матч", "матча", "матчей"])} сегодня`}
      />
      <HeroStat
        icon={<Trophy aria-hidden="true" className="size-4 text-subtle-foreground" />}
        value={summary.events}
        label={plural(summary.events, ["турнир", "турнира", "турниров"])}
      />
    </>
  )
}
