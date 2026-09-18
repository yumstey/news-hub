import { ArrowUpRight } from "lucide-react"

import { VARIANT_LABEL, WEAR_LABEL, WEAR_ORDER, WEAR_SHORT, formatUsd } from "@/entities/skin"
import type { SkinPrice, SkinVariant, SkinWear } from "@/entities/skin"
import { marketUrl } from "@/shared/config"
import { cn } from "@/shared/lib/style"

const VARIANT_TONE: Record<SkinVariant, string> = {
  normal: "text-foreground",
  stattrak: "text-stattrak",
  souvenir: "text-rarity-gold",
}

function Cell({ price }: { price: SkinPrice | undefined }) {
  if (price === undefined) return <td className="px-3 py-2.5 text-subtle-foreground">—</td>

  if (price.min === null) {
    return <td className="px-3 py-2.5 text-caption text-subtle-foreground">нет лотов</td>
  }

  return (
    <td className="px-3 py-2">
      <a
        href={marketUrl("skinport", price.marketHashName, price.itemPage ?? undefined)}
        target="_blank"
        rel="sponsored noopener noreferrer"
        className="group inline-flex flex-col rounded-xs"
      >
        <span className="inline-flex items-center gap-1 text-sm font-bold tabular-nums text-foreground transition-colors duration-150 group-hover:text-primary">
          {formatUsd(price.min)}
          <ArrowUpRight
            aria-hidden="true"
            className="size-3 opacity-0 transition-opacity duration-150 group-hover:opacity-100"
          />
        </span>
        <span className="text-caption tabular-nums text-subtle-foreground">
          {price.median === null ? `${price.quantity} лот.` : `медиана ${formatUsd(price.median)}`}
        </span>
      </a>
    </td>
  )
}

export type PriceTableProps = {
  prices: readonly SkinPrice[]
  className?: string
}

export function PriceTable({ prices, className }: PriceTableProps) {
  // Колонку показываем, только если в ней есть хоть одна цена: пустой «Сувенирный» — шум.
  const variants = (["normal", "stattrak", "souvenir"] as const).filter((variant) =>
    prices.some((price) => price.variant === variant && (variant === "normal" || price.min !== null)),
  )
  const wears: (SkinWear | null)[] = prices.some((price) => price.wear === null)
    ? [null]
    : WEAR_ORDER.filter((wear) => prices.some((price) => price.wear === wear))

  const lookup = (wear: SkinWear | null, variant: SkinVariant): SkinPrice | undefined =>
    prices.find((price) => price.wear === wear && price.variant === variant)

  return (
    <div className={cn("overflow-x-auto rounded-surface border border-border bg-surface", className)}>
      <table className="w-full min-w-[28rem] border-collapse text-left">
        <caption className="sr-only">Цены по износу и вариантам, USD</caption>
        <thead>
          <tr className="border-b border-border bg-elevated">
            <th scope="col" className="px-3 py-2 text-overline uppercase text-subtle-foreground">
              Износ
            </th>
            {variants.map((variant) => (
              <th
                key={variant}
                scope="col"
                className={cn("px-3 py-2 text-overline uppercase", VARIANT_TONE[variant])}
              >
                {VARIANT_LABEL[variant]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {wears.map((wear) => (
            <tr key={wear ?? "none"} className="border-b border-border last:border-b-0">
              <th scope="row" className="px-3 py-2.5 align-middle">
                {wear === null ? (
                  <span className="text-caption text-muted-foreground">Без износа</span>
                ) : (
                  <span className="flex flex-col">
                    <span className="text-caption font-semibold text-foreground">
                      {WEAR_LABEL[wear]}
                    </span>
                    <span className="text-overline text-subtle-foreground">{WEAR_SHORT[wear]}</span>
                  </span>
                )}
              </th>
              {variants.map((variant) => (
                <Cell key={variant} price={lookup(wear, variant)} />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
