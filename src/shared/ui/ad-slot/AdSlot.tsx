import { ArrowUpRight } from "lucide-react"

import { AD_DISCLOSURE, AD_GAMBLING_NOTICE, adCreative } from "@/shared/config"
import type { AdSlotName } from "@/shared/config"
import { cn } from "@/shared/lib/style"

export type AdSlotProps = {
  slot: AdSlotName
  className?: string
}

export function AdSlot({ slot, className }: AdSlotProps) {
  const creative = adCreative(slot)

  if (creative === null) return null

  return (
    <aside
      aria-label={AD_DISCLOSURE}
      className={cn(
        "relative overflow-hidden rounded-surface border border-dashed border-border-strong bg-elevated",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-8 -top-10 size-28 rounded-full bg-primary/10 blur-2xl"
      />

      <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-1.5">
        <span className="text-overline uppercase tracking-wider text-subtle-foreground">
          {AD_DISCLOSURE}
        </span>
        <span className="flex items-center gap-1.5">
          {creative.gambling ? (
            <span className="inline-flex h-4 items-center rounded-xs bg-muted px-1 text-[0.5625rem] font-bold text-muted-foreground">
              {AD_GAMBLING_NOTICE}
            </span>
          ) : null}
          <span className="text-overline uppercase text-subtle-foreground">
            {creative.partner}
          </span>
        </span>
      </div>

      <a
        href={creative.href}
        target="_blank"
        rel="sponsored noopener noreferrer"
        className="group relative flex flex-col gap-1.5 p-4 transition-colors duration-150 hover:bg-muted/50"
      >
        <span className="text-subheading text-foreground">{creative.headline}</span>
        <span className="text-caption text-muted-foreground">{creative.subline}</span>
        <span className="mt-1 inline-flex items-center gap-1 text-caption font-semibold text-primary">
          {creative.cta}
          <ArrowUpRight
            aria-hidden="true"
            className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </span>
      </a>
    </aside>
  )
}
