import Image from "next/image"
import { Suspense } from "react"
import type { ReactNode } from "react"

import { getGameInfo } from "@/entities/game-update"
import { cn } from "@/shared/lib/style"

/**
 * За каждым разделом закреплён свой скриншот CS2 из Steam: разделы узнаются
 * визуально, а при повторном заходе картинка уже в кэше браузера.
 */
const SCENES = {
  matches: 0,
  results: 1,
  events: 2,
  rankings: 3,
  teams: 4,
  players: 5,
  news: 6,
  streams: 7,
  skins: 8,
  cases: 9,
  updates: 10,
  game: 11,
} as const

export type HeroScene = keyof typeof SCENES

async function Backdrop({ scene }: { scene: HeroScene }) {
  const info = await getGameInfo()
  const shots = info.ok ? info.data.screenshots : []
  const shot = shots.length === 0 ? undefined : shots[SCENES[scene] % shots.length]

  if (shot === undefined) return null

  return (
    <Image
      src={shot.full}
      alt=""
      fill
      quality={50}
      sizes="(min-width: 1280px) 80rem, 100vw"
      className="-z-20 object-cover object-center opacity-55"
    />
  )
}

export type SectionHeroProps = {
  scene: HeroScene
  title: ReactNode
  description?: ReactNode
  /** Справа (на телефоне — снизу): счётчики, ссылки, онлайн. */
  aside?: ReactNode
  className?: string
}

/**
 * Заголовок раздела на атмосферном скриншоте игры. Текст рендерится сразу,
 * картинка догружается отдельно и никогда не задерживает H1.
 */
export function SectionHero({ scene, title, description, aside, className }: SectionHeroProps) {
  return (
    <section
      className={cn(
        "relative isolate overflow-hidden rounded-surface border border-border bg-elevated",
        className,
      )}
    >
      <Suspense fallback={null}>
        <Backdrop scene={scene} />
      </Suspense>
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-linear-to-r from-elevated via-elevated/90 to-elevated/35"
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 -z-10 h-px bg-linear-to-r from-primary/60 via-primary/20 to-transparent"
      />

      <div className="flex flex-col gap-4 p-5 sm:p-7 lg:flex-row lg:items-end lg:justify-between lg:p-8">
        <div className="flex max-w-content flex-col gap-2">
          <h1 className="text-title font-bold tracking-tight text-foreground">{title}</h1>
          {description === undefined ? null : (
            <p className="text-caption text-muted-foreground sm:text-body">{description}</p>
          )}
        </div>
        {aside === undefined ? null : <div className="flex shrink-0 flex-wrap gap-2">{aside}</div>}
      </div>
    </section>
  )
}
