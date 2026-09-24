import type { Route } from "next"
import Link from "next/link"
import type { ReactNode } from "react"

import { cn } from "@/shared/lib/style"
import { Container } from "@/shared/ui/container"

export type HeroFrameProps = {
  /** Картинка-подложка: <Image fill className="-z-20 …" />. */
  backdrop: ReactNode
  children: ReactNode
  /** Правая колонка на десктопе, снизу — на телефоне. */
  aside?: ReactNode
  className?: string
}

/**
 * Каркас баннера раздела: экран высотой 600px на ноутбуке, поверх — скриншот
 * игры под градиентами из токенов, поэтому он одинаково читается в обеих темах.
 */
export function HeroFrame({ backdrop, children, aside, className }: HeroFrameProps) {
  return (
    <section
      className={cn(
        "relative isolate flex min-h-96 items-center overflow-hidden border-b border-border sm:min-h-112 lg:min-h-150",
        className,
      )}
    >
      {backdrop}

      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-linear-to-r from-background via-background/88 to-background/25"
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 -z-10 h-2/5 bg-linear-to-t from-background to-transparent"
      />
      <div
        aria-hidden="true"
        className="absolute -left-24 top-1/4 -z-10 size-96 rounded-full bg-primary/15 blur-3xl"
      />

      <Container
        className={cn(
          "grid w-full grid-cols-[minmax(0,1fr)] items-center gap-8 py-10 sm:gap-10 sm:py-12 lg:gap-12 lg:py-16",
          aside === undefined ? undefined : "lg:grid-cols-[minmax(0,1fr)_24rem]",
        )}
      >
        <div className="flex flex-col gap-6">{children}</div>
        {aside}
      </Container>
    </section>
  )
}

export type HeroLink = {
  label: string
  href: Route
}

/** Быстрые переходы в соседние разделы прямо из баннера. */
export function HeroLinks({ links }: { links: readonly HeroLink[] }) {
  if (links.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="inline-flex h-9 items-center rounded-full border border-border bg-background/60 px-4 text-caption font-medium text-muted-foreground backdrop-blur-sm transition-colors duration-150 hover:border-border-strong hover:text-foreground"
        >
          {link.label}
        </Link>
      ))}
    </div>
  )
}
