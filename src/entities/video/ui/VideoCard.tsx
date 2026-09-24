import { Play } from "lucide-react"
import Image from "next/image"

import { formatDate, toIsoDate } from "@/shared/lib/date"
import { cn } from "@/shared/lib/style"

import { formatViews, videoThumbnail, videoWatchUrl } from "../lib/videoMedia"
import type { Video } from "../model/video"

export type VideoCardProps = {
  video: Video
  eager?: boolean
  className?: string
}

function PlayBadge({ small = false }: { small?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm transition-all duration-200 group-hover:scale-110 group-hover:bg-youtube",
        small ? "size-10" : "size-12",
      )}
    >
      <Play className={cn("translate-x-px fill-current", small ? "size-4" : "size-5")} />
    </span>
  )
}

/** Карточка ролика 16:9: обложка, канал, просмотры и дата. */
export function VideoCard({ video, eager = false, className }: VideoCardProps) {
  return (
    <a
      href={videoWatchUrl(video)}
      target="_blank"
      rel="noopener noreferrer external"
      className={cn("group flex animate-rise-in flex-col gap-2.5", className)}
    >
      <span className="relative block aspect-video w-full overflow-hidden rounded-surface border border-border bg-muted">
        <Image
          src={videoThumbnail(video)}
          alt=""
          fill
          loading={eager ? "eager" : undefined}
          sizes="(min-width: 1024px) 24rem, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
        <span className="absolute left-2 top-2 rounded-xs bg-black/70 px-1.5 py-0.5 text-overline font-bold uppercase text-white">
          {video.channel.label}
        </span>
        <PlayBadge />
      </span>
      <span className="flex flex-col gap-1">
        <h3 className="line-clamp-2 text-sm font-semibold text-foreground transition-colors duration-150 group-hover:text-primary">
          {video.title}
        </h3>
        <span className="flex flex-wrap items-center gap-x-1.5 text-caption text-subtle-foreground">
          <span>{video.channel.name}</span>
          {video.views === null ? null : (
            <>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">{formatViews(video.views)}</span>
            </>
          )}
          {video.publishedAt === null ? null : (
            <>
              <span aria-hidden="true">·</span>
              <time dateTime={toIsoDate(video.publishedAt)} className="tabular-nums">
                {formatDate(video.publishedAt)}
              </time>
            </>
          )}
        </span>
      </span>
    </a>
  )
}

/** Вертикальная карточка Shorts для горизонтальной ленты. */
export function ShortCard({ video, className }: VideoCardProps) {
  return (
    <a
      href={videoWatchUrl(video)}
      target="_blank"
      rel="noopener noreferrer external"
      className={cn("group flex w-40 shrink-0 flex-col gap-2 sm:w-44", className)}
    >
      <span className="relative block aspect-9/16 w-full overflow-hidden rounded-surface border border-border bg-muted">
        <Image
          src={videoThumbnail(video)}
          alt=""
          fill
          sizes="11rem"
          className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
        <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-black/80 to-transparent" />
        <span className="absolute left-2 top-2 rounded-xs bg-black/70 px-1.5 py-0.5 text-overline font-bold uppercase text-white">
          {video.channel.label}
        </span>
        {video.views === null ? null : (
          <span className="absolute bottom-2 left-2 text-overline font-semibold tracking-normal text-white/90">
            {formatViews(video.views)}
          </span>
        )}
        <PlayBadge small />
      </span>
      <h3 className="line-clamp-2 text-caption font-semibold text-foreground transition-colors duration-150 group-hover:text-primary">
        {video.title}
      </h3>
    </a>
  )
}

/** Компактная строка: миниатюра слева, заголовок и просмотры справа. */
export function VideoRow({ video, className }: VideoCardProps) {
  return (
    <a
      href={videoWatchUrl(video)}
      target="_blank"
      rel="noopener noreferrer external"
      className={cn("group flex items-start gap-3", className)}
    >
      <span className="relative aspect-video w-28 shrink-0 overflow-hidden rounded-sm border border-border bg-muted">
        <Image
          src={videoThumbnail({ id: video.id, kind: "video" })}
          alt=""
          fill
          sizes="7rem"
          className="object-cover transition-transform duration-300 group-hover:scale-[1.04]"
        />
      </span>
      <span className="flex min-w-0 flex-col gap-1">
        <span className="line-clamp-2 text-caption font-semibold text-foreground transition-colors duration-150 group-hover:text-primary">
          {video.title}
        </span>
        <span className="truncate text-overline tracking-normal text-subtle-foreground">
          {video.channel.label}
          {video.views === null ? null : ` · ${formatViews(video.views)}`}
        </span>
      </span>
    </a>
  )
}

export function VideoCardSkeleton() {
  return (
    <div className="flex flex-col gap-2.5">
      <span className="aspect-video w-full rounded-surface border border-border bg-skeleton" />
      <span className="h-3 w-4/5 rounded-xs bg-skeleton" />
      <span className="h-3 w-2/5 rounded-xs bg-skeleton" />
    </div>
  )
}
