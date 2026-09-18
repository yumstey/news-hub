import Image from "next/image"
import Link from "next/link"

import { PLAYER_ROLE_LABEL, playerHref, preferPhoto } from "@/entities/player"
import type { FreePhoto, Player } from "@/entities/player"
import { toCountry } from "@/shared/model"
import { CountryTag } from "@/shared/ui/country-tag"

/** Силуэт вместо пустого места: у новичков составов фото ещё нет ни в одном источнике. */
function Silhouette({ nickname }: { nickname: string }) {
  return (
    <span aria-hidden="true" className="absolute inset-0 flex items-end justify-center bg-linear-to-b from-muted to-elevated">
      <svg viewBox="0 0 100 120" className="h-[85%] w-auto text-border-strong">
        <circle cx="50" cy="38" r="22" fill="currentColor" />
        <path d="M8 120c2-26 20-42 42-42s40 16 42 42z" fill="currentColor" />
      </svg>
      <span className="absolute left-2.5 top-2 text-heading font-bold text-subtle-foreground/60">
        {nickname.slice(0, 1).toUpperCase()}
      </span>
    </span>
  )
}

export function TeamRosterStrip({
  players,
  photos = {},
}: {
  players: readonly Player[]
  photos?: Readonly<Record<string, FreePhoto>>
}) {
  if (players.length === 0) return null

  const roster = players.slice(0, 5).map((player) => ({
    player,
    photo: preferPhoto(player.photo?.url ?? null, photos[player.nickname.toLowerCase()]),
  }))
  const credits = roster.flatMap(({ player, photo }) =>
    photo?.credit == null ? [] : [{ nickname: player.nickname, credit: photo.credit }],
  )

  return (
    <div className="flex flex-col gap-2">
      <ul className="relative -mx-gutter flex snap-x snap-mandatory gap-2 overflow-x-auto px-gutter pb-1 lg:mx-0 lg:grid lg:grid-cols-5 lg:px-0">
        {roster.map(({ player, photo }) => (
          <li key={player.id} className="w-32 shrink-0 snap-start lg:w-auto">
            <Link
              href={playerHref(player.slug)}
              className="group flex h-full flex-col overflow-hidden rounded-surface border border-border bg-linear-to-b from-elevated to-surface transition-colors duration-150 hover:border-primary/50"
            >
              <span className="relative block aspect-4/5 w-full overflow-hidden">
                {photo === null ? (
                  <Silhouette nickname={player.nickname} />
                ) : (
                  <Image
                    src={photo.url}
                    alt={player.nickname}
                    fill
                    sizes="(min-width: 1024px) 12rem, 8rem"
                    className="object-cover object-top transition-transform duration-300 group-hover:scale-105"
                  />
                )}
                {player.role === null ? null : (
                  <span className="absolute right-2 top-2 rounded-xs bg-black/60 px-1.5 py-0.5 text-overline font-bold uppercase text-white backdrop-blur-xs">
                    {PLAYER_ROLE_LABEL[player.role]}
                  </span>
                )}
                <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-surface/80 to-transparent" />
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

      {credits.length === 0 ? null : (
        <p className="text-overline normal-case tracking-normal text-subtle-foreground">
          Фото:{" "}
          {credits.map(({ nickname, credit }, index) => (
            <span key={nickname}>
              {index === 0 ? null : "; "}
              {nickname} —{" "}
              <a href={credit.source} target="_blank" rel="noopener noreferrer" className="underline decoration-border-strong underline-offset-2 hover:text-primary">
                {credit.author}, {credit.license}
              </a>
            </span>
          ))}
          , Wikimedia Commons.
        </p>
      )}
    </div>
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
