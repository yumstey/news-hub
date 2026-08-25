import Image from "next/image"
import Link from "next/link"

import { PLAYER_ROLE_LABEL } from "@/entities/player"
import type { Player } from "@/entities/player"
import type { PlayerCareer } from "@/entities/player"
import { teamHref, TeamLogo } from "@/entities/team"
import { formatDate } from "@/shared/lib/date"
import { cn } from "@/shared/lib/style"
import { CountryTag } from "@/shared/ui/country-tag"
import { Heading, Text } from "@/shared/ui/typography"

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-control bg-muted px-4 py-3">
      <span className="text-subheading font-bold tabular-nums text-foreground">{value}</span>
      <span className="text-overline uppercase text-subtle-foreground">{label}</span>
    </div>
  )
}

export function PlayerHero({ player, career }: { player: Player; career: PlayerCareer }) {
  return (
    <div className="animate-rise-in overflow-hidden rounded-surface border border-border bg-surface">
      <div className="relative grid gap-0 sm:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
        <div className="relative aspect-square w-full overflow-hidden bg-linear-to-br from-primary-soft via-elevated to-elevated sm:aspect-auto sm:min-h-[26rem]">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -left-10 -top-10 size-56 rounded-full bg-primary/20 blur-3xl"
          />
          {player.photo === null ? (
            <span
              aria-hidden="true"
              className="absolute inset-0 flex items-center justify-center text-[8rem] font-bold leading-none text-border-strong"
            >
              {player.nickname.slice(0, 1).toUpperCase()}
            </span>
          ) : (
            <Image
              src={player.photo.url}
              alt={player.nickname}
              fill
              priority
              sizes="(min-width: 640px) 22rem, 100vw"
              className="object-cover object-top"
            />
          )}
        </div>

        <div className="flex flex-col justify-center gap-5 p-5 sm:p-6">
          <div className="flex flex-col gap-2">
            <CountryTag
              country={player.country}
              showName
              size="md"
              className="text-caption text-muted-foreground"
            />
            <Heading level={1} size="display" className="break-words">
              {player.nickname}
            </Heading>
            {player.realName === null ? null : (
              <Text size="lead" tone="muted">
                {player.realName}
              </Text>
            )}
          </div>

          {player.team === null ? null : (
            <Link
              href={teamHref(player.team.slug)}
              className={cn(
                "group inline-flex min-h-14 w-fit items-center gap-3 rounded-control border border-border px-4 py-2.5",
                "transition-all duration-200 hover:-translate-y-px hover:border-primary/40 hover:bg-muted",
              )}
            >
              <TeamLogo
                logo={player.team.logo}
                darkLogo={player.team.darkLogo}
                size={36}
                className="size-9 rounded-sm"
              />
              <span className="flex flex-col">
                <span className="text-overline uppercase text-subtle-foreground">Команда</span>
                <span className="text-sm font-semibold text-foreground transition-colors duration-150 group-hover:text-primary">
                  {player.team.name}
                </span>
              </span>
            </Link>
          )}

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Возраст" value={player.age === null ? "—" : String(player.age)} />
            <Stat
              label="Роль"
              value={player.role === null ? "—" : PLAYER_ROLE_LABEL[player.role]}
            />
            <Stat label="Турниров" value={String(career.eventCount)} />
            <Stat label="Топ-турниров" value={String(career.tierOneCount)} />
          </div>

          {career.firstSeen === null ? null : (
            <Text size="caption" tone="subtle">
              Первый турнир в базе — {formatDate(career.firstSeen)}
            </Text>
          )}
        </div>
      </div>
    </div>
  )
}
