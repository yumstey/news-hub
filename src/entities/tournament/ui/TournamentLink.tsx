import Link from "next/link"

import { cn } from "@/shared/lib/style"

import { tournamentHref } from "../lib/tournamentHref"

export type TournamentLinkProps = {
  disciplineSlug: string
  slug: string
  name: string
  className?: string
}

export function TournamentLink({
  disciplineSlug,
  slug,
  name,
  className,
}: TournamentLinkProps) {
  return (
    <Link
      href={tournamentHref(disciplineSlug, slug)}
      className={cn(
        "truncate text-caption text-muted-foreground transition-colors duration-150 hover:text-foreground",
        className,
      )}
    >
      {name}
    </Link>
  )
}
