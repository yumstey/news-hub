import { ROUTES } from "@/shared/config"
import { Suspense } from "react"

import {
  channelUrl,
  formatViews,
  getVideos,
  ShortCard,
  VideoCard,
  VideoCardSkeleton,
  videoThumbnail,
  VideoRow,
  VIDEO_CHANNELS,
} from "@/entities/video"
import type { Video } from "@/entities/video"
import { SITE_URL } from "@/shared/config"
import { AdSlot } from "@/shared/ui/ad-slot"
import { Play } from "lucide-react"
import { plural } from "@/shared/lib/text"
import { Breadcrumbs } from "@/shared/ui/breadcrumbs"
import { Container, Section, Stack } from "@/shared/ui/container"
import { EmptyState } from "@/shared/ui/empty-state"
import { JsonLd } from "@/shared/ui/json-ld"
import { SectionHeading } from "@/shared/ui/section-heading"
import { Text } from "@/shared/ui/typography"
import { YouTubePlayer } from "@/shared/ui/youtube-player"
import { HeroLinks, HeroStat, SectionHero } from "@/widgets/game-hub"

import { breadcrumbsJsonLd, trail } from "../_lib/breadcrumbs"
import { VIDEOS_DESCRIPTION, VIDEOS_TITLE } from "./_lib/metadata"

export { generateMetadata } from "./_lib/metadata"

const CRUMBS = trail({ label: "Видео" })
const GRID_LIMIT = 9
const SHORTS_LIMIT = 12

function videoJsonLd(videos: readonly Video[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: VIDEOS_TITLE,
    numberOfItems: videos.length,
    itemListElement: videos.map((video, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "VideoObject",
        name: video.title,
        thumbnailUrl: videoThumbnail(video),
        embedUrl: `https://www.youtube.com/embed/${video.id}`,
        ...(video.publishedAt === null ? {} : { uploadDate: video.publishedAt.toISOString() }),
        ...(video.description.length === 0 ? {} : { description: video.description.slice(0, 300) }),
      },
    })),
  }
}

const HERO_LINKS = [
  { label: "Новости", href: ROUTES.news },
  { label: "Эфиры", href: ROUTES.streams },
  { label: "Матчи", href: ROUTES.matches },
] as const

async function HeroStats() {
  const result = await getVideos()

  if (!result.ok) return null

  return (
    <>
      <HeroStat
        icon={<Play aria-hidden="true" className="size-4 text-subtle-foreground" />}
        value={result.data.length}
        label={plural(result.data.length, ["ролик", "ролика", "роликов"])}
      />
      <HeroStat
        value={VIDEO_CHANNELS.length}
        label={plural(VIDEO_CHANNELS.length, ["канал", "канала", "каналов"])}
      />
    </>
  )
}

export default function Page() {
  return (
    <>
      <JsonLd data={breadcrumbsJsonLd(CRUMBS)} />

      <SectionHero
        scene="videos"
        crumbs={<Breadcrumbs items={CRUMBS} />}
        title={VIDEOS_TITLE}
        description={VIDEOS_DESCRIPTION}
        stats={
          <Suspense fallback={null}>
            <HeroStats />
          </Suspense>
        }
        actions={<HeroLinks links={HERO_LINKS} />}
      />

      <Container>
        <Section spacing="md">
          <Stack gap="lg">
            <Suspense fallback={<VideosSkeleton />}>
              <VideoHub />
            </Suspense>

            <Text size="caption" tone="subtle">
              Ролики принадлежат их авторам и воспроизводятся встроенным плеером YouTube по адресу{" "}
              {SITE_URL.replace(/^https?:\/\//, "")}. Подписаться на каналы:{" "}
              {VIDEO_CHANNELS.map((channel, index) => (
                <span key={channel.id}>
                  {index === 0 ? null : ", "}
                  <a
                    href={channelUrl(channel)}
                    target="_blank"
                    rel="noopener noreferrer external"
                    className="text-primary underline-offset-2 hover:underline"
                  >
                    {channel.name}
                  </a>
                </span>
              ))}
              .
            </Text>
          </Stack>
        </Section>
      </Container>
    </>
  )
}

async function VideoHub() {
  const result = await getVideos()

  if (!result.ok) {
    return <EmptyState tone="danger" title="Видео недоступны" description={result.error.message} />
  }

  const full = result.data.filter((video) => video.kind === "video")
  const shorts = result.data.filter((video) => video.kind === "short")
  const [featured] = [...full].sort((left, right) => (right.views ?? 0) - (left.views ?? 0))

  if (featured === undefined) return <EmptyState title="Видео пока нет" />

  const rest = full.filter((video) => video.id !== featured.id)

  return (
    <>
      <JsonLd data={videoJsonLd(full.slice(0, 20))} />

      <section className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="flex min-w-0 flex-col gap-3">
          <YouTubePlayer id={featured.id} title={featured.title} poster={videoThumbnail(featured)} />
          <h2 className="text-subheading text-foreground">{featured.title}</h2>
          <p className="text-caption text-subtle-foreground">
            {featured.channel.name}
            {featured.views === null ? null : ` · ${formatViews(featured.views)}`}
          </p>
        </div>

        <div className="flex min-w-0 flex-col gap-3">
          <SectionHeading title="Смотрят сейчас" level={3} />
          <ul className="flex flex-col gap-3">
            {rest.slice(0, 5).map((video) => (
              <li key={video.id}>
                <VideoRow video={video} />
              </li>
            ))}
          </ul>
          <AdSlot slot="sidebar" className="mt-auto" />
        </div>
      </section>

      {shorts.length === 0 ? null : (
        <section className="flex flex-col gap-4">
          <SectionHeading title="Shorts" />
          <ul className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2">
            {shorts.slice(0, SHORTS_LIMIT).map((video) => (
              <li key={video.id} className="snap-start">
                <ShortCard video={video} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="flex flex-col gap-4">
        <SectionHeading title="Новые ролики" />
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {rest.slice(5, 5 + GRID_LIMIT).map((video) => (
            <li key={video.id}>
              <VideoCard video={video} />
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}

function VideosSkeleton() {
  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <span className="aspect-video w-full rounded-surface border border-border bg-skeleton" />
        <span className="h-64 rounded-surface border border-border bg-skeleton" />
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <VideoCardSkeleton key={index} />
        ))}
      </div>
    </div>
  )
}
