import { ChevronRight } from "lucide-react"
import Link from "next/link"

import { TeamLogo } from "@/entities/team/@x/player"

import { playerHref } from "../lib/playerHref"
import { PLAYER_ROLE_LABEL } from "../model/player"
import type { Player } from "../model/player"
import { Avatar } from "@/shared/ui/avatar"
import { CountryTag } from "@/shared/ui/country-tag"
import { Text } from "@/shared/ui/typography"

export function PlayerCard({ player }: { player: Player }) {
  return (
    <Link
      href={playerHref(player.slug)}
      className="flex h-full min-h-20 animate-rise-in items-center gap-3 rounded-control border border-border bg-surface p-3 transition-all duration-200 hover:-translate-y-px hover:border-border-strong hover:bg-muted/60 hover:shadow-surface active:translate-y-0 active:bg-muted"
    >
      <Avatar name={player.nickname} src={player.photo?.url} size="lg" shape="rounded" />
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <h3 className="truncate text-sm font-semibold text-foreground">{player.nickname}</h3>
        {player.realName === null ? null : (
          <span className="truncate text-caption text-muted-foreground">{player.realName}</span>
        )}
        <CountryTag
          country={player.country}
          showName
          className="text-caption text-subtle-foreground"
        />
      </span>
      {player.team === null ? null : (
        <span className="flex shrink-0 flex-col items-end gap-1">
          <TeamLogo
            logo={player.team.logo}
            darkLogo={player.team.darkLogo}
            size={24}
            className="size-6 rounded-xs"
          />
          {player.role === null ? null : (
            <Text as="span" size="overline" tone="subtle">
              {PLAYER_ROLE_LABEL[player.role]}
            </Text>
          )}
        </span>
      )}
      <ChevronRight
        aria-hidden="true"
        className="size-5 shrink-0 text-subtle-foreground sm:hidden"
      />
    </Link>
  )
}

export function PlayersGridSkeleton() {
  const items = Array.from({ length: 12 }, (_, index) => index)

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <div key={item} className="h-20 rounded-control border border-border bg-skeleton" />
      ))}
    </div>
  )
}
