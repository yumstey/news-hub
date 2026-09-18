import type { StreamLink } from "../model/match"

const PREVIEW_HOST = "https://static-cdn.jtvnw.net/previews-ttv"

export function twitchChannel(url: string): string | null {
  try {
    const parsed = new URL(url)

    if (!parsed.hostname.endsWith("twitch.tv")) return null

    const channel = parsed.pathname.split("/").filter(Boolean)[0]

    return channel === undefined || !/^[a-z0-9_]{2,25}$/i.test(channel) ? null : channel.toLowerCase()
  } catch {
    return null
  }
}

/**
 * Живой кадр трансляции Twitch — публичная картинка без ключа API. Свежесть
 * обеспечивает сам CDN Twitch (Cache-Control: max-age=300), метка времени не нужна.
 */
export function twitchPreview(url: string, width = 640, height = 360): string | null {
  const channel = twitchChannel(url)

  if (channel === null) return null

  return `${PREVIEW_HOST}/live_user_${channel}-${width}x${height}.jpg`
}

/** Какую трансляцию показать зрителю: официальная русская Twitch → любая официальная → любая Twitch. */
export function pickStream(streams: readonly StreamLink[]): StreamLink | null {
  const twitch = streams.filter((stream) => twitchChannel(stream.url) !== null)
  const ranked = [
    twitch.find((stream) => stream.official && stream.language === "RU"),
    twitch.find((stream) => stream.official),
    twitch[0],
    streams.find((stream) => stream.official),
    streams[0],
  ]

  return ranked.find((stream) => stream !== undefined) ?? null
}
