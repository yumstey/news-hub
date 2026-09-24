import { videoIdSchema } from "../model/video"
import type { Video, VideoChannel } from "../model/video"

const ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&apos;": "'",
}

function unescape(value: string): string {
  return value
    .replace(/&(?:amp|lt|gt|quot|#39|apos);/g, (entity) => ENTITIES[entity] ?? entity)
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
}

function tag(block: string, name: string): string | null {
  const match = new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`).exec(block)

  return match?.[1] === undefined ? null : unescape(match[1]).trim()
}

/** Atom-лента канала YouTube → ролики. Shorts отличаются ссылкой /shorts/. */
export function parseYoutubeFeed(xml: string, channel: VideoChannel): Video[] {
  const videos: Video[] = []

  for (const entry of xml.split("<entry>").slice(1)) {
    const id = videoIdSchema.safeParse(tag(entry, "yt:videoId"))
    const title = tag(entry, "title")
    const published = Date.parse(tag(entry, "published") ?? "")

    if (!id.success || title === null || !Number.isFinite(published)) continue

    const link = /<link rel="alternate" href="([^"]+)"/.exec(entry)?.[1] ?? ""
    const views = /<media:statistics views="(\d+)"/.exec(entry)?.[1]

    videos.push({
      id: id.data,
      kind: link.includes("/shorts/") ? "short" : "video",
      title,
      description: tag(entry, "media:description") ?? "",
      channel,
      publishedAt: new Date(published),
      views: views === undefined ? null : Number(views),
    })
  }

  return videos
}
