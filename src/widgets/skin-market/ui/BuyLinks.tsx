import { ArrowUpRight, ShoppingCart } from "lucide-react"

import { AFFILIATE_DISCLOSURE, marketUrl, partnerName } from "@/shared/config"
import type { MarketPartner } from "@/shared/config"
import { cn } from "@/shared/lib/style"
import { buttonClassName } from "@/shared/ui/button"

export type BuyLinksProps = {
  marketHashName: string
  /** Страница Skinport самого ходового варианта — самая конверсионная ссылка. */
  skinportPage: string | null
  className?: string
}

const SECONDARY: readonly MarketPartner[] = ["csfloat", "steam"]

export function BuyLinks({ marketHashName, skinportPage, className }: BuyLinksProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <a
        href={marketUrl("skinport", marketHashName, skinportPage ?? undefined)}
        target="_blank"
        rel="sponsored noopener noreferrer"
        className={buttonClassName({ size: "lg", fullWidth: true })}
      >
        <ShoppingCart aria-hidden="true" className="size-4" />
        Купить на {partnerName("skinport")}
      </a>

      <div className="grid grid-cols-2 gap-2">
        {SECONDARY.map((partner) => (
          <a
            key={partner}
            href={marketUrl(partner, marketHashName)}
            target="_blank"
            rel="sponsored noopener noreferrer"
            className={buttonClassName({ variant: "outline", size: "md", fullWidth: true })}
          >
            {partnerName(partner)}
            <ArrowUpRight aria-hidden="true" className="size-3.5" />
          </a>
        ))}
      </div>

      <p className="text-caption leading-snug text-subtle-foreground">
        {AFFILIATE_DISCLOSURE}
      </p>
    </div>
  )
}
