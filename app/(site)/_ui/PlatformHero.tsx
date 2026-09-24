import { ArrowRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import type { ReactNode } from "react"

import { STEAM_ART } from "@/entities/game-update"
import { CS2, ROUTES } from "@/shared/config"
import { cn } from "@/shared/lib/style"
import { buttonClassName } from "@/shared/ui/button"
import { Container } from "@/shared/ui/container"
import { HeroFrame } from "@/widgets/game-hub"

const ACTIONS = [
  { label: "Матчи сегодня", href: ROUTES.matches, primary: true },
  { label: "Цены скинов", href: ROUTES.skins, primary: false },
  { label: "Об игре", href: ROUTES.game, primary: false },
] as const

/** Источники, на которых держится платформа: доверие с первого экрана. */
const SOURCES = ["Valve VRS", "PandaScore", "Steam", "Liquipedia", "Skinport"]

export type PlatformHeroProps = {
  stats?: ReactNode
  /** Правая колонка: матч дня. */
  spotlight?: ReactNode
}

/**
 * Герой главной на официальном арте CS2 из Steam: слева обещание платформы,
 * справа — матч, который можно смотреть прямо сейчас.
 */
export function PlatformHero({ stats, spotlight }: PlatformHeroProps) {
  return (
    <HeroFrame
      backdrop={
        <Image
          src={STEAM_ART.hero}
          alt=""
          fill
          sizes="100vw"
          quality={50}
          loading="eager"
          fetchPriority="high"
          // На светлой теме арт выцветает под белым градиентом — держим его плотнее.
          className="-z-20 object-cover object-[68%_center] opacity-95 dark:opacity-70"
        />
      }
      aside={spotlight}
    >
      <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-background/60 px-3 py-1 text-overline uppercase text-muted-foreground backdrop-blur-sm">
        <span aria-hidden="true" className="size-1.5 rounded-full bg-primary" />
        Киберспорт · статистика · маркет
      </span>

      <div className="flex max-w-3xl flex-col gap-4">
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

      <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-overline uppercase tracking-wider text-subtle-foreground">
        <span className="text-muted-foreground">Данные:</span>
        {SOURCES.map((source, index) => (
          <span key={source} className="flex items-center gap-2">
            {index === 0 ? null : <span aria-hidden="true" className="size-1 rounded-full bg-border-strong" />}
            {source}
          </span>
        ))}
      </p>
    </HeroFrame>
  )
}

export function PlatformHeroSkeleton() {
  return (
    <div className="border-b border-border bg-elevated">
      <Container className="flex min-h-96 flex-col justify-center gap-4 sm:min-h-112 lg:min-h-150">
        <div className="h-6 w-56 rounded-full bg-skeleton" />
        <div className="h-12 w-full max-w-xl rounded-sm bg-skeleton" />
        <div className="h-5 w-full max-w-md rounded-sm bg-skeleton" />
      </Container>
    </div>
  )
}
