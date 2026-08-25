import Link from "next/link"

import { cn } from "@/shared/lib/style"
import { Avatar } from "@/shared/ui/avatar"
import { CountryTag } from "@/shared/ui/country-tag"
import type { Country, ImageAsset } from "@/shared/model"

import { playerHref } from "../lib/playerHref"

export type PlayerIdentityProps = {
  slug: string
  nickname: string
  photo?: ImageAsset | null
  country: Country | null
  size?: "sm" | "md"
  showCountryName?: boolean
  className?: string
}

export function PlayerIdentity({
  slug,
  nickname,
  photo,
  country,
  size = "sm",
  showCountryName = false,
  className,
}: PlayerIdentityProps) {
  return (
    <span className={cn("inline-flex min-w-0 items-center gap-2", className)}>
      <Avatar name={nickname} src={photo?.url} size={size === "sm" ? "sm" : "md"} shape="rounded" />
      <span className="flex min-w-0 flex-col">
        <Link
          href={playerHref(slug)}
          className="truncate text-sm font-semibold text-foreground transition-colors duration-150 hover:text-primary"
        >
          {nickname}
        </Link>
        <CountryTag
          country={country}
          showName={showCountryName}
          className="text-caption text-muted-foreground"
        />
      </span>
    </span>
  )
}
