import Link from "next/link"

import { getTeamPlayers, PLAYER_ROLE_LABEL, playerHref } from "@/entities/player"
import { cn } from "@/shared/lib/style"
import { Avatar } from "@/shared/ui/avatar"
import { CountryTag } from "@/shared/ui/country-tag"
import { EmptyState } from "@/shared/ui/empty-state"
import { SectionHeading } from "@/shared/ui/section-heading"
import { Text } from "@/shared/ui/typography"

export type TeamRosterProps = {
  disciplineSlug: string
  teamSlug: string
  title?: string
  className?: string
}

export async function TeamRoster({
  disciplineSlug,
  teamSlug,
  title = "Состав",
  className,
}: TeamRosterProps) {
  const result = await getTeamPlayers(disciplineSlug, teamSlug)

  if (!result.ok) {
    return (
      <EmptyState
        tone="danger"
        title="Состав недоступен"
        description={result.error.message}
        className={className}
      />
    )
  }

  if (result.data.length === 0) {
    return <EmptyState title="Состав не объявлен" className={className} />
  }

  return (
    <section className={cn("flex flex-col gap-4", className)}>
      <SectionHeading title={title} />
      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {result.data.map((player) => (
          <li key={player.id}>
            <Link
              href={playerHref(disciplineSlug, player.slug)}
              className="flex h-full items-center gap-3 rounded-control border border-border bg-surface p-3 transition-colors duration-150 hover:border-border-strong hover:bg-muted/60"
            >
              <Avatar name={player.nickname} src={player.photo?.url} size="lg" shape="rounded" />
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="truncate text-sm font-semibold text-foreground">
                  {player.nickname}
                </span>
                <span className="truncate text-caption text-muted-foreground">
                  {player.realName}
                </span>
                <CountryTag
                  country={player.country}
                  showName
                  className="text-caption text-subtle-foreground"
                />
              </span>
              <span className="flex shrink-0 flex-col items-end gap-1">
                <Text as="span" size="overline" tone="subtle">
                  {PLAYER_ROLE_LABEL[player.role]}
                </Text>
                <span className="text-sm font-bold tabular-nums text-foreground">
                  {player.stats.rating.toFixed(2)}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

export function TeamRosterSkeleton({ className }: { className?: string }) {
  const items = Array.from({ length: 5 }, (_, index) => index)

  return (
    <div className={cn("grid gap-3 sm:grid-cols-2 xl:grid-cols-3", className)}>
      {items.map((item) => (
        <div key={item} className="h-20 rounded-control border border-border bg-skeleton" />
      ))}
    </div>
  )
}
