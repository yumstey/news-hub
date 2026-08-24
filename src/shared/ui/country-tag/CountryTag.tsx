import type { Country } from "@/shared/model"
import { cn } from "@/shared/lib/style"

export type CountryTagProps = {
  country: Country
  showName?: boolean
  className?: string
}

export function CountryTag({ country, showName = false, className }: CountryTagProps) {
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <span
        aria-hidden="true"
        className="inline-flex h-4 min-w-6 items-center justify-center rounded-xs border border-border bg-muted px-1 text-[0.5625rem] font-bold uppercase leading-none tracking-wide text-muted-foreground"
      >
        {country.code}
      </span>
      {showName ? <span>{country.name}</span> : <span className="sr-only">{country.name}</span>}
    </span>
  )
}
