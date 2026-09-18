import { ArrowRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import type { ReactNode } from "react"

import { STEAM_ART } from "@/entities/game-update"
import { CS2, ROUTES } from "@/shared/config"
import { cn } from "@/shared/lib/style"
import { buttonClassName } from "@/shared/ui/button"
import { Container } from "@/shared/ui/container"

const ACTIONS = [
  { label: "Матчи сегодня", href: ROUTES.matches, primary: true },
  { label: "Цены скинов", href: ROUTES.skins, primary: false },
  { label: "Об игре", href: ROUTES.game, primary: false },
] as const

/**
 * Герой главной на официальном арте CS2 из Steam: сразу понятно, о какой игре
 * сайт. Картинка — фон под градиентом, поэтому текст читается в обеих темах.
 */
export function PlatformHero({ stats }: { stats?: ReactNode }) {
  return (
    <section className="relative isolate overflow-hidden border-b border-border">
      <Image
        src={STEAM_ART.hero}
        alt=""
        fill
        sizes="100vw"
        quality={50}
        loading="eager"
        fetchPriority="high"
        className="-z-20 object-cover object-[72%_center] opacity-70"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-linear-to-r from-background via-background/85 to-background/20"
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 -z-10 h-1/2 bg-linear-to-t from-background to-transparent"
      />

      <Container className="flex flex-col gap-5 py-10 sm:py-14 lg:py-16">
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-background/60 px-3 py-1 text-overline uppercase text-muted-foreground backdrop-blur-sm">
          <span aria-hidden="true" className="size-1.5 rounded-full bg-primary" />
          Киберспорт · статистика · маркет
        </span>

        <div className="flex max-w-3xl flex-col gap-3">
          <h1 className="text-title font-bold tracking-tight text-foreground sm:text-display">
            {CS2.title}: матчи, статистика и скины
          </h1>
          <p className="max-w-content text-body text-muted-foreground sm:text-lead">{CS2.tagline}</p>
        </div>

        {stats === undefined ? null : <div className="flex flex-wrap gap-2">{stats}</div>}

        <div className="flex flex-wrap gap-2">
          {ACTIONS.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className={buttonClassName({
                variant: action.primary ? "primary" : "outline",
                size: "md",
                className: cn(action.primary ? undefined : "bg-background/50 backdrop-blur-sm"),
              })}
            >
              {action.label}
              {action.primary ? <ArrowRight aria-hidden="true" className="size-4" /> : null}
            </Link>
          ))}
        </div>
      </Container>
    </section>
  )
}

export function PlatformHeroSkeleton() {
  return (
    <div className="border-b border-border bg-elevated">
      <Container className="flex flex-col gap-4 py-12">
        <div className="h-6 w-56 rounded-full bg-skeleton" />
        <div className="h-12 w-full max-w-xl rounded-sm bg-skeleton" />
        <div className="h-5 w-full max-w-md rounded-sm bg-skeleton" />
      </Container>
    </div>
  )
}
