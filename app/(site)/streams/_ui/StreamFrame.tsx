"use client"

import { Play } from "lucide-react"
import Image from "next/image"
import { useState } from "react"

export type StreamFrameProps = {
  title: string
  /** Плеер без автозапуска — для эфира, открытого сразу. */
  idleSrc: string
  /** Плеер с автозапуском — после нажатия на обложку. */
  activeSrc: string
  poster: string | null
  autoStart: boolean
  label: string
}

/**
 * Окно трансляции. Разом грузить десяток плееров нельзя: каждый тянет мегабайты
 * и начинает играть, поэтому сразу открыт только первый эфир, остальные —
 * обложка с кнопкой.
 */
export function StreamFrame({ title, idleSrc, activeSrc, poster, autoStart, label }: StreamFrameProps) {
  const [started, setStarted] = useState(false)
  const src = started ? activeSrc : idleSrc

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-surface border border-live/40 bg-black">
      {autoStart || started ? (
        <iframe
          src={src}
          title={title}
          allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
          loading="lazy"
          className="absolute inset-0 size-full border-0"
        />
      ) : (
        <button
          type="button"
          onClick={() => setStarted(true)}
          aria-label={`Смотреть: ${label}`}
          className="group absolute inset-0 size-full cursor-pointer"
        >
          {poster === null ? (
            <span aria-hidden="true" className="absolute inset-0 bg-linear-to-br from-primary-soft via-elevated to-live-soft" />
          ) : (
            <Image
              src={poster}
              alt=""
              fill
              unoptimized
              sizes="(min-width: 1280px) 40rem, 100vw"
              className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
          )}
          <span aria-hidden="true" className="absolute inset-0 bg-black/25 transition-colors duration-200 group-hover:bg-black/10" />
          <span
            aria-hidden="true"
            className="absolute left-1/2 top-1/2 flex size-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-live text-live-foreground shadow-lg transition-transform duration-200 group-hover:scale-110"
          >
            <Play className="size-7 translate-x-px fill-current" />
          </span>
          <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-xs bg-live px-2 py-0.5 text-overline font-bold uppercase text-live-foreground">
            <span aria-hidden="true" className="size-1.5 animate-pulse rounded-full bg-live-foreground" />
            Live
          </span>
        </button>
      )}
    </div>
  )
}
