import * as flags from "country-flag-icons/string/3x2"

import { cn } from "@/shared/lib/style"
import type { Country } from "@/shared/model"

const FLAG_BY_CODE = flags as Record<string, string | undefined>

export type CountryTagProps = {
  country: Country | null | undefined
  showName?: boolean
  size?: "sm" | "md"
  className?: string
}

const flagSize: Record<"sm" | "md", string> = {
  sm: "h-3 w-[1.125rem]",
  md: "h-3.5 w-[1.3125rem]",
}

export function CountryTag({
  country,
  showName = false,
  size = "sm",
  className,
}: CountryTagProps) {
  if (country === null || country === undefined) return null

  const svg = FLAG_BY_CODE[country.code]

  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      {svg === undefined ? (
        <span
          aria-hidden="true"
          className="inline-flex h-4 min-w-6 items-center justify-center rounded-xs border border-border bg-muted px-1 text-[0.5625rem] font-bold uppercase leading-none tracking-wide text-muted-foreground"
        >
          {country.code}
        </span>
      ) : (
        <span
          aria-hidden="true"
          className={cn(
            "inline-block shrink-0 overflow-hidden rounded-xs ring-1 ring-border",
            "[&>svg]:block [&>svg]:h-full [&>svg]:w-full",
            flagSize[size],
          )}
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      )}
      {showName ? (
        <span className="truncate">{country.name}</span>
      ) : (
        <span className="sr-only">{country.name}</span>
      )}
    </span>
  )
}
