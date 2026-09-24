import { pluralize } from "@/shared/lib/text"

import type { Video } from "../model/video"

/** Обложка: 16:9 в HD для роликов, вертикальный кадр 9:16 для Shorts. */
export function videoThumbnail(video: Pick<Video, "id" | "kind">): string {
  return video.kind === "short"
    ? `https://i.ytimg.com/vi/${video.id}/oar2.jpg`
    : `https://i.ytimg.com/vi/${video.id}/hq720.jpg`
}

export function videoWatchUrl(video: Pick<Video, "id">): string {
  return `https://www.youtube.com/watch?v=${video.id}`
}

/** Встраивание без cookie до нажатия «play» — youtube-nocookie. */
export function videoEmbedUrl(video: Pick<Video, "id">): string {
  return `https://www.youtube-nocookie.com/embed/${video.id}`
}

const COMPACT = new Intl.NumberFormat("ru-RU", { notation: "compact", maximumFractionDigits: 1 })

export function formatViews(views: number): string {
  if (views < 1000) return pluralize(views, ["просмотр", "просмотра", "просмотров"])

  return `${COMPACT.format(views)} просмотров`
}

/**
 * Первый абзац описания без ссылок: дальше каналы пишут промо и партнёрские
 * ссылки, которые на нашей странице не нужны.
 */
export function videoSummary(description: string): string {
  const [first = ""] = description.split(/\n\s*\n/)

  return first
    .split("\n")
    .filter((line) => !/https?:\/\//.test(line))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim()
}
