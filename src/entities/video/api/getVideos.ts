import { cacheTag } from "next/cache"
import { z } from "zod"

import { apiError, fail, fetchJson, fetchText, ok } from "@/shared/api"
import type { ApiResult } from "@/shared/api"
import { CS2_MODULE, feedTag } from "@/shared/config"
import { cacheFor } from "@/shared/lib/cache"

import type { Video, VideoId } from "../model/video"
import { parseYoutubeFeed } from "./parseYoutubeFeed"
import { feedUrl, VIDEO_CHANNELS } from "./videoChannels"

/** Свежие ролики всех каналов, новые первыми. */
export async function getVideos(): Promise<ApiResult<Video[]>> {
  "use cache"
  cacheTag(feedTag(`${CS2_MODULE}-videos`))

  const feeds = await Promise.all(
    VIDEO_CHANNELS.map(async (channel) => {
      const result = await fetchText(feedUrl(channel))

      return result.ok ? parseYoutubeFeed(result.data, channel) : null
    }),
  )

  cacheFor("article", feeds.every((feed) => feed !== null))

  if (feeds.every((feed) => feed === null)) {
    return fail(apiError("network", "Видео с YouTube сейчас недоступны"))
  }

  const seen = new Set<string>()
  const videos = feeds
    .flatMap((feed) => feed ?? [])
    .filter((video) => {
      if (seen.has(video.id)) return false

      seen.add(video.id)

      return true
    })
    .sort((left, right) => (right.publishedAt?.getTime() ?? 0) - (left.publishedAt?.getTime() ?? 0))

  return ok(videos)
}

const oembedSchema = z.object({
  title: z.string().min(1),
  author_url: z.string(),
  width: z.number().optional(),
  height: z.number().optional(),
})

/**
 * Ролик, выпавший из RSS (там только последние 15), ищем через oEmbed —
 * страница видео продолжает жить. Показываем лишь ролики наших каналов,
 * чтобы по адресу /videos/<id> нельзя было открыть произвольное видео.
 */
async function lookupVideo(id: VideoId): Promise<ApiResult<Video | null>> {
  "use cache"

  const watch = `https://www.youtube.com/watch?v=${id}`
  const result = await fetchJson(
    `https://www.youtube.com/oembed?url=${encodeURIComponent(watch)}&format=json`,
    oembedSchema,
  )

  if (!result.ok) {
    // 401/403/404 — ролик удалён или закрыт: это ответ, а не сбой.
    const gone = result.error.status === 401 || result.error.status === 403 || result.error.status === 404

    cacheFor("reference", gone)

    return gone ? ok(null) : fail(result.error)
  }

  cacheFor("reference", true)

  const handle = /\/@([^/?#]+)/.exec(result.data.author_url)?.[1]?.toLowerCase()
  const channel = VIDEO_CHANNELS.find((entry) => entry.handle.toLowerCase() === handle)

  if (channel === undefined) return ok(null)

  const vertical = (result.data.height ?? 0) > (result.data.width ?? 0)

  return ok({
    id,
    kind: vertical ? "short" : "video",
    title: result.data.title,
    description: "",
    channel,
    publishedAt: null,
    views: null,
  })
}

export async function getVideoById(id: VideoId): Promise<ApiResult<Video | null>> {
  const list = await getVideos()
  const found = list.ok ? list.data.find((video) => video.id === id) : undefined

  if (found !== undefined) return ok(found)

  return lookupVideo(id)
}
