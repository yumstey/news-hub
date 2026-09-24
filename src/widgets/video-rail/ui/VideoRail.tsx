import Link from "next/link"

import { getVideos, VideoCard, VideoCardSkeleton } from "@/entities/video"
import { ROUTES } from "@/shared/config"
import { cn } from "@/shared/lib/style"
import { SectionHeading } from "@/shared/ui/section-heading"

export type VideoRailProps = {
  limit?: number
  title?: string
  className?: string
}

/** Лента свежих роликов с официальных каналов — хайлайты матчей и интервью. */
export async function VideoRail({ limit = 4, title = "Видео", className }: VideoRailProps) {
  const result = await getVideos()

  if (!result.ok) return null

  const videos = result.data.filter((video) => video.kind === "video").slice(0, limit)

  if (videos.length === 0) return null

  return (
    <section className={cn("flex flex-col gap-4", className)}>
      <SectionHeading
        title={title}
        action={
          <Link
            href={ROUTES.videos}
            className="text-caption font-medium text-primary transition-colors duration-150 hover:text-primary-hover"
          >
            Все видео
          </Link>
        }
      />
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {videos.map((video) => (
          <li key={video.id}>
            <VideoCard video={video} />
          </li>
        ))}
      </ul>
    </section>
  )
}

export function VideoRailSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }, (_, index) => (
        <VideoCardSkeleton key={index} />
      ))}
    </div>
  )
}
