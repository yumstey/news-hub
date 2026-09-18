import Image from "next/image"
import Link from "next/link"

import { cn } from "@/shared/lib/style"

import { crateHref } from "../lib/crateHref"
import type { CrateSummary } from "../model/crate"

const usd = new Intl.NumberFormat("ru-RU", { style: "currency", currency: "USD" })
const year = new Intl.DateTimeFormat("ru-RU", { month: "long", year: "numeric" })

export type CrateCardProps = {
  crate: CrateSummary
  /** Карточка в первом ряду сетки — грузим картинку сразу. */
  eager?: boolean
  className?: string
}

export function CrateCard({ crate, eager = false, className }: CrateCardProps) {
  return (
    <Link
      href={crateHref(crate.slug)}
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-surface border border-border bg-surface",
        "transition-all duration-200 hover:-translate-y-0.5 hover:border-rarity-gold/50 hover:shadow-surface",
        className,
      )}
    >
      <span className="relative block aspect-[4/3] w-full overflow-hidden bg-elevated">
        <span
          aria-hidden="true"
          className="absolute inset-0 bg-radial-[at_50%_65%] from-rarity-gold/20 via-transparent to-transparent"
        />
        {crate.image === null ? null : (
          <Image
            src={crate.image}
            alt={crate.name}
            fill
            loading={eager ? "eager" : undefined}
            sizes="(min-width: 1280px) 14rem, (min-width: 640px) 33vw, 50vw"
            className="object-contain p-[10%] drop-shadow-lg transition-transform duration-300 group-hover:scale-105"
          />
        )}
      </span>

      <span className="flex flex-1 flex-col gap-1 p-3">
        <span className="line-clamp-2 text-sm font-semibold leading-snug text-foreground">
          {crate.name}
        </span>
        <span className="text-caption text-subtle-foreground">
          {crate.releasedAt === null ? "Дата выхода неизвестна" : year.format(crate.releasedAt)}
          {" · "}
          {crate.itemCount} скинов
        </span>
        <span className="mt-auto flex items-end justify-between gap-2 pt-2">
          <span className="truncate text-overline uppercase text-rarity-gold">
            {crate.rareLabel ?? "Редкий предмет"}
          </span>
          <span className="shrink-0 text-sm font-bold tabular-nums text-foreground">
            {crate.price === null ? "—" : usd.format(crate.price)}
          </span>
        </span>
      </span>
    </Link>
  )
}
