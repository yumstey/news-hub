import { ExternalLink } from "lucide-react"

import type { Player } from "@/entities/player"
import { TeamLogo } from "@/entities/team"
import type { Team, TeamProfile as Profile } from "@/entities/team"
import { cn } from "@/shared/lib/style"
import { toCountry } from "@/shared/model"
import { BrandIcon, brandTitle } from "@/shared/ui/brand-icon"
import type { BrandKey } from "@/shared/ui/brand-icon"
import { CountryTag } from "@/shared/ui/country-tag"
import { Heading } from "@/shared/ui/typography"

const BRAND_BY_LABEL: Record<string, BrandKey> = {
  X: "x",
  Instagram: "instagram",
  YouTube: "youtube",
  Telegram: "telegram",
  Twitch: "twitch",
  Facebook: "facebook",
  VK: "vk",
  Discord: "discord",
}

function averageAge(players: readonly Player[]): string | null {
  const ages = players
    .map((player) => player.age)
    .filter((age): age is number => age !== null && age > 0)

  if (ages.length === 0) return null

  const mean = ages.reduce((total, age) => total + age, 0) / ages.length

  return mean.toFixed(1)
}

function Row({
  label,
  children,
  accent,
}: {
  label: string
  children: React.ReactNode
  accent?: boolean
}) {
  return (
    <div className="flex min-h-11 flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-2.5 last:border-0">
      <span className="text-caption text-muted-foreground">{label}</span>
      <span
        className={cn(
          "flex items-center gap-2 text-sm font-semibold tabular-nums",
          accent === true ? "text-primary" : "text-foreground",
        )}
      >
        {children}
      </span>
    </div>
  )
}

export type TeamProfileProps = {
  team: Team
  profile: Profile
  players: readonly Player[]
}

export function TeamProfile({ team, profile, players }: TeamProfileProps) {
  const age = averageAge(players)
  const [coach] = profile.coaches

  return (
    <div className="overflow-hidden rounded-surface border border-border bg-surface">
      <div className="flex flex-wrap items-center gap-4 border-b border-border bg-elevated px-4 py-5 sm:px-6">
        <TeamLogo
          logo={team.logo}
          darkLogo={team.darkLogo}
          size={72}
          eager
          className="size-14 sm:size-16"
        />

        <div className="flex min-w-0 flex-col gap-1">
          <CountryTag
            country={team.country}
            showName
            size="md"
            className="text-caption text-muted-foreground"
          />
          <Heading level={1} size="title" className="truncate">
            {team.name}
          </Heading>
        </div>

        {profile.links.length > 0 ? (
          <ul className="ml-auto flex flex-wrap items-center gap-2">
            {profile.links.map((link) => {
              const brand = BRAND_BY_LABEL[link.label]

              return (
                <li key={link.url}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer external"
                    title={brand === undefined ? link.label : brandTitle(brand)}
                    className="inline-flex size-11 items-center justify-center rounded-control border border-border text-muted-foreground transition-colors duration-150 hover:border-border-strong hover:bg-muted hover:text-foreground"
                  >
                    {brand === undefined ? (
                      <ExternalLink aria-hidden="true" className="size-4" />
                    ) : (
                      <BrandIcon brand={brand} className="size-4" />
                    )}
                    <span className="sr-only">{link.label}</span>
                  </a>
                </li>
              )
            })}
          </ul>
        ) : null}
      </div>

      <div className="grid sm:grid-cols-2">
        <div className="border-b border-border sm:border-b-0 sm:border-r">
          <Row label="Мировой рейтинг" accent>
            {team.worldRanking === null ? "—" : `#${team.worldRanking}`}
          </Row>
          <Row label="Очки рейтинга">
            {team.rankingPoints === null ? "—" : team.rankingPoints}
          </Row>
        </div>
        <div>
          <Row label="Средний возраст состава">{age === null ? "—" : age}</Row>
          <Row label="Тренер">
            {coach === undefined ? (
              "—"
            ) : (
              <>
                <CountryTag country={toCountry(coach.countryCode)} />
                {coach.name}
              </>
            )}
          </Row>
        </div>
      </div>
    </div>
  )
}
