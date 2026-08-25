import Image from "next/image"
import Link from "next/link"

import { playerHref } from "@/entities/player"
import type { Player } from "@/entities/player"
import { toCountry } from "@/shared/model"
import { CountryTag } from "@/shared/ui/country-tag"

function Initials({ nickname }: { nickname: string }) {
  return (
    <span
      aria-hidden="true"
      className="flex size-full items-center justify-center text-display font-bold text-border-strong"
    >
      {nickname.slice(0, 1).toUpperCase()}
    </span>
  )
}

export function TeamRosterStrip({ players }: { players: readonly Player[] }) {
  if (players.length === 0) return null

  return (
    <ul className="-mx-gutter flex snap-x snap-mandatory gap-2 overflow-x-auto px-gutter pb-1 lg:mx-0 lg:grid lg:grid-cols-5 lg:px-0">
      {players.slice(0, 5).map((player) => (
        <li key={player.id} className="w-32 shrink-0 snap-start lg:w-auto">
          <Link
            href={playerHref(player.slug)}
            className="group flex h-full flex-col overflow-hidden rounded-surface border border-border bg-linear-to-b from-elevated to-surface transition-colors duration-150 hover:border-primary/50"
          >
            <span className="relative block aspect-4/5 w-full overflow-hidden">
              {player.photo === null ? (
                <Initials nickname={player.nickname} />
              ) : (
                <Image
                  src={player.photo.url}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 12rem, 8rem"
                  className="object-cover object-top"
                />
              )}
            </span>
            <span className="flex items-center gap-1.5 border-t border-border px-2.5 py-2">
              <CountryTag country={toCountry(player.country?.code ?? null)} />
              <span className="truncate text-caption font-semibold text-foreground transition-colors duration-150 group-hover:text-primary">
                {player.nickname}
              </span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}

export function TeamRosterStripSkeleton() {
  const items = Array.from({ length: 5 }, (_, index) => index)

  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
      {items.map((item) => (
        <div key={item} className="aspect-4/5 rounded-surface border border-border bg-skeleton" />
      ))}
    </div>
  )
}
