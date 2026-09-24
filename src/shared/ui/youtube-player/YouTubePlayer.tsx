"use client"

import { Play } from "lucide-react"
import Image from "next/image"
import { useState } from "react"

import { cn } from "@/shared/lib/style"

export type YouTubePlayerProps = {
  id: string
  title: string
  poster: string
  vertical?: boolean
  className?: string
}

/**
 * Плеер YouTube «по клику»: до нажатия на странице только обложка, iframe
 * (около 1 МБ скриптов) грузится, когда зритель действительно хочет смотреть.
 * Домен youtube-nocookie не ставит cookie до начала воспроизведения.
 */
export function YouTubePlayer({ id, title, poster, vertical = false, className }: YouTubePlayerProps) {
  const [playing, setPlaying] = useState(false)

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-surface border border-border bg-black",
        vertical ? "mx-auto aspect-9/16 max-w-sm" : "aspect-video",
        className,
      )}
    >
      {playing ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          className="absolute inset-0 size-full border-0"
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          aria-label={`Смотреть: ${title}`}
          className="group absolute inset-0 size-full cursor-pointer"
        >
          <Image
            src={poster}
            alt=""
            fill
            loading="eager"
            fetchPriority="high"
            sizes={vertical ? "24rem" : "(min-width: 1024px) 50rem, 100vw"}
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
          <span aria-hidden="true" className="absolute inset-0 bg-black/15 transition-colors duration-200 group-hover:bg-black/5" />
          <span
            aria-hidden="true"
            className="absolute left-1/2 top-1/2 flex h-14 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-2xl bg-youtube text-white shadow-lg transition-transform duration-200 group-hover:scale-110"
          >
            <Play className="size-7 translate-x-px fill-current" />
          </span>
        </button>
      )}
    </div>
  )
}
