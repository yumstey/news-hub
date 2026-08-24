import Image from "next/image"
import Link from "next/link"

import { cn } from "@/shared/lib/style"
import type { Country, ImageAsset } from "@/shared/model"
import { CountryTag } from "@/shared/ui/country-tag"

import { teamHref } from "../lib/teamHref"

export type TeamIdentitySize = "sm" | "md" | "lg"

const logoSize: Record<TeamIdentitySize, number> = { sm: 24, md: 32, lg: 48 }
const logoClass: Record<TeamIdentitySize, string> = {
  sm: "size-6",
  md: "size-8",
  lg: "size-12",
}
const nameClass: Record<TeamIdentitySize, string> = {
  sm: "text-caption font-semibold",
  md: "text-sm font-semibold",
  lg: "text-subheading",
}

export type TeamIdentityProps = {
  disciplineSlug: string
  slug: string
  name: string
  logo: ImageAsset
  country?: Country
  size?: TeamIdentitySize
  link?: boolean
  className?: string
}

export function TeamIdentity({
  disciplineSlug,
  slug,
  name,
  logo,
  country,
  size = "md",
  link = true,
  className,
}: TeamIdentityProps) {
  const label = (
    <span className={cn("truncate text-foreground", nameClass[size])}>{name}</span>
  )

  return (
    <span className={cn("inline-flex min-w-0 items-center gap-2.5", className)}>
      <Image
        src={logo.url}
        alt={logo.alt}
        width={logoSize[size]}
        height={logoSize[size]}
        className={cn("shrink-0 rounded-sm object-contain", logoClass[size])}
      />
      <span className="flex min-w-0 flex-col">
        {link ? (
          <Link
            href={teamHref(disciplineSlug, slug)}
            className="min-w-0 transition-colors duration-150 hover:text-primary"
          >
            {label}
          </Link>
        ) : (
          label
        )}
        {country ? (
          <CountryTag country={country} className="text-caption text-muted-foreground" />
        ) : null}
      </span>
    </span>
  )
}
