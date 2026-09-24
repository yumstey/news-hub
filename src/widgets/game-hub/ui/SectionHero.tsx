import Image from "next/image"
import { Suspense } from "react"
import type { ReactNode } from "react"

import { getGameInfo } from "@/entities/game-update"

import { HeroFrame } from "./HeroFrame"

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
  videos: 12,
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
      sizes="100vw"
      loading="eager"
      fetchPriority="high"
      // На светлой теме кадр выцветает под белым градиентом — держим плотнее.
      className="-z-20 object-cover object-center opacity-90 dark:opacity-65"
    />
  )
}

export type SectionHeroProps = {
  scene: HeroScene
  title: ReactNode
  description?: ReactNode
  /** Хлебные крошки над заголовком. */
  crumbs?: ReactNode
  /** Счётчики раздела: онлайн, число матчей, объём базы. */
  stats?: ReactNode
  /** Ссылки и кнопки под описанием. */
  actions?: ReactNode
  /** Карточка справа: матч дня, топ рейтинга и подобное. */
  aside?: ReactNode
}

/**
 * Баннер раздела на атмосферном скриншоте игры. Текст рендерится сразу,
 * картинка догружается отдельно и никогда не задерживает H1.
 */
export function SectionHero({
  scene,
  title,
  description,
  crumbs,
  stats,
  actions,
  aside,
}: SectionHeroProps) {
  return (
    <HeroFrame
      backdrop={
        <Suspense fallback={null}>
          <Backdrop scene={scene} />
        </Suspense>
      }
      aside={aside}
    >
      {crumbs}

      <div className="flex max-w-3xl flex-col gap-4">
        <h1 className="text-title font-bold tracking-tight text-foreground sm:text-display">{title}</h1>
        {description === undefined ? null : (
          <p className="max-w-content text-body text-muted-foreground sm:text-lead">{description}</p>
        )}
      </div>

      {stats === undefined ? null : <div className="flex flex-wrap gap-2">{stats}</div>}
      {actions}
    </HeroFrame>
  )
}
