import { Search } from "lucide-react"
import type { Route } from "next"
import Link from "next/link"

import {
  CATEGORY_LABEL,
  CATEGORY_ORDER,
  RARITY_LABEL,
  SORT_LABEL,
  rarityTone,
  skinQueryParams,
} from "@/entities/skin"
import type { SkinQuery, SkinRarity, SkinSort } from "@/entities/skin"
import { cn } from "@/shared/lib/style"

/** Редкости, у которых вообще есть оружейные скины, — без служебных. */
const FILTER_RARITIES: readonly SkinRarity[] = [
  "covert",
  "classified",
  "restricted",
  "milspec",
  "industrial",
  "consumer",
]

function hrefFor(basePath: string, query: SkinQuery, patch: Partial<SkinQuery>): Route {
  const params = new URLSearchParams(skinQueryParams({ ...query, ...patch }))
  const search = params.toString()

  return (search.length === 0 ? basePath : `${basePath}?${search}`) as Route
}

function Chip({
  href,
  active,
  children,
  dot,
}: {
  href: Route
  active: boolean
  children: React.ReactNode
  dot?: string
}) {
  return (
    <Link
      href={href}
      scroll={false}
      aria-current={active ? "true" : undefined}
      className={cn(
        "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border px-3 text-caption font-medium transition-colors duration-150",
        active
          ? "border-primary bg-primary-soft text-primary"
          : "border-border text-muted-foreground hover:border-border-strong hover:text-foreground",
      )}
    >
      {dot === undefined ? null : (
        <span aria-hidden="true" className={cn("size-2 rounded-full", dot)} />
      )}
      {children}
    </Link>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
      <span className="w-24 shrink-0 text-overline uppercase text-subtle-foreground">{label}</span>
      <div className="-mx-gutter flex gap-1.5 overflow-x-auto px-gutter pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
        {children}
      </div>
    </div>
  )
}

export type MarketFiltersProps = {
  basePath: string
  query: SkinQuery
  /** На страницах конкретного оружия категория уже задана адресом. */
  showCategories?: boolean
  total: number
}

export function MarketFilters({
  basePath,
  query,
  showCategories = true,
  total,
}: MarketFiltersProps) {
  return (
    <div className="flex flex-col gap-3 rounded-surface border border-border bg-surface p-4">
      <form action={basePath} method="get" className="flex gap-2" role="search">
        {query.category === null ? null : (
          <input type="hidden" name="category" value={query.category} />
        )}
        {query.rarity === null ? null : <input type="hidden" name="rarity" value={query.rarity} />}
        {query.sort === "popular" ? null : <input type="hidden" name="sort" value={query.sort} />}

        <label className="relative flex-1">
          <span className="sr-only">Поиск скина</span>
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle-foreground"
          />
          <input
            type="search"
            name="q"
            defaultValue={query.search}
            placeholder="Например, Asiimov или Karambit"
            className="h-10 w-full rounded-control border border-border bg-background pl-9 pr-3 text-sm text-foreground placeholder:text-subtle-foreground focus:border-primary focus:outline-none"
          />
        </label>
        <button
          type="submit"
          className="h-10 shrink-0 rounded-control bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors duration-150 hover:bg-primary-hover"
        >
          Найти
        </button>
      </form>

      {showCategories ? (
        <Row label="Тип">
          <Chip href={hrefFor(basePath, query, { category: null })} active={query.category === null}>
            Все
          </Chip>
          {CATEGORY_ORDER.map((category) => (
            <Chip
              key={category}
              href={hrefFor(basePath, query, { category })}
              active={query.category === category}
            >
              {CATEGORY_LABEL[category]}
            </Chip>
          ))}
        </Row>
      ) : null}

      <Row label="Редкость">
        <Chip href={hrefFor(basePath, query, { rarity: null })} active={query.rarity === null}>
          Любая
        </Chip>
        {FILTER_RARITIES.map((rarity) => (
          <Chip
            key={rarity}
            href={hrefFor(basePath, query, { rarity })}
            active={query.rarity === rarity}
            dot={rarityTone(rarity).bar}
          >
            {RARITY_LABEL[rarity]}
          </Chip>
        ))}
      </Row>

      <Row label="Порядок">
        {(Object.keys(SORT_LABEL) as SkinSort[]).map((sort) => (
          <Chip key={sort} href={hrefFor(basePath, query, { sort })} active={query.sort === sort}>
            {SORT_LABEL[sort]}
          </Chip>
        ))}
      </Row>

      <p className="text-caption text-subtle-foreground" aria-live="polite">
        Найдено: <span className="font-semibold tabular-nums text-foreground">{total}</span>
      </p>
    </div>
  )
}
