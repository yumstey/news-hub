import { CalendarDays, MapPin, Trophy, Users } from "lucide-react"

import {
  formatPrize,
  TOURNAMENT_STATUS_LABEL,
  TournamentTierBadge,
} from "@/entities/tournament"
import type { Tournament } from "@/entities/tournament"
import { SITE } from "@/shared/config"
import { formatDate } from "@/shared/lib/date"
import { Badge } from "@/shared/ui/badge"
import { Container } from "@/shared/ui/container"
import { CountryTag } from "@/shared/ui/country-tag"
import { Heading, Text } from "@/shared/ui/typography"

const statusVariant = {
  ongoing: "live",
  upcoming: "soft",
  finished: "neutral",
} as const

export function EventHero({ tournament }: { tournament: Tournament }) {
  return (
    <div className="relative overflow-hidden border-b border-border bg-linear-to-br from-primary-soft via-elevated to-elevated">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-32 size-96 rounded-full bg-primary/15 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-primary/50 via-primary/15 to-transparent"
      />

      <Container className="relative flex flex-col gap-5 py-10">
        <div className="flex flex-wrap items-center gap-2">
          <TournamentTierBadge tier={tournament.tier} />
          <Badge
            variant={statusVariant[tournament.status]}
            dot={tournament.status === "ongoing"}
            pulse={tournament.status === "ongoing"}
          >
            {TOURNAMENT_STATUS_LABEL[tournament.status]}
          </Badge>
        </div>

        <div className="flex flex-col gap-2">
          <Heading level={1} size="display">
            {tournament.name}
          </Heading>
          <Text size="lead" tone="muted" className="max-w-content">
            {tournament.description}
          </Text>
        </div>
      </Container>
    </div>
  )
}

function MetaTile({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-3 px-4 py-3">
      <span aria-hidden="true" className="mt-0.5 text-subtle-foreground">
        {icon}
      </span>
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="text-overline uppercase tracking-wider text-subtle-foreground">
          {label}
        </span>
        <span className="text-sm font-semibold text-foreground">{children}</span>
      </span>
    </div>
  )
}

export function EventMeta({ tournament }: { tournament: Tournament }) {
  return (
    <div className="grid divide-y divide-border overflow-hidden rounded-surface border border-border bg-surface sm:grid-cols-2 sm:divide-x lg:grid-cols-4 lg:divide-y-0">
      <MetaTile icon={<CalendarDays className="size-4" />} label="Даты">
        <span className="tabular-nums">
          {formatDate(tournament.startsAt)} —{" "}
          {formatDate(tournament.endsAt)}
        </span>
      </MetaTile>
      <MetaTile icon={<Trophy className="size-4" />} label="Призовой фонд">
        <span className="tabular-nums">
          {formatPrize(tournament.prizePool, tournament.currency, SITE.locale)}
        </span>
      </MetaTile>
      <MetaTile icon={<Users className="size-4" />} label="Команды">
        <span className="tabular-nums">{tournament.teams.length}</span>
      </MetaTile>
      <MetaTile icon={<MapPin className="size-4" />} label="Формат">
        <span className="flex items-center gap-2">
          {tournament.location.online ? "Онлайн" : "LAN"}
          <CountryTag country={tournament.location.country} />
        </span>
      </MetaTile>
    </div>
  )
}
