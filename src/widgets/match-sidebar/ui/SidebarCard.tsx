import type { Route } from "next"
import Link from "next/link"
import type { ReactNode } from "react"

import { cn } from "@/shared/lib/style"

export type SidebarCardProps = {
  title: string
  moreHref?: Route
  moreLabel?: string
  children: ReactNode
  className?: string
}

/** Рамка блока боковой колонки: заголовок, ссылка «все» и содержимое. */
export function SidebarCard({ title, moreHref, moreLabel, children, className }: SidebarCardProps) {
  return (
    <section className={cn("overflow-hidden rounded-surface border border-border bg-surface", className)}>
      <header className="flex items-center justify-between gap-3 border-b border-border bg-elevated/60 px-4 py-2.5">
        <h2 className="text-caption font-bold uppercase tracking-wider text-foreground">{title}</h2>
        {moreHref === undefined ? null : (
          <Link
            href={moreHref}
            className="text-overline font-semibold uppercase text-primary transition-colors duration-150 hover:text-primary-hover"
          >
            {moreLabel ?? "Все"}
          </Link>
        )}
      </header>
      {children}
    </section>
  )
}

export function SidebarCardSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="overflow-hidden rounded-surface border border-border bg-surface">
      <div className="h-10 border-b border-border bg-elevated/60" />
      <div className="flex flex-col gap-3 p-4">
        {Array.from({ length: rows }, (_, index) => (
          <span key={index} className="h-6 rounded-xs bg-skeleton" />
        ))}
      </div>
    </div>
  )
}
