import { z } from "zod"

/** Идентификатор ролика YouTube — ровно 11 символов base64url. */
export const videoIdSchema = z.string().regex(/^[A-Za-z0-9_-]{11}$/).brand<"VideoId">()
export type VideoId = z.infer<typeof videoIdSchema>

export type VideoKind = "video" | "short"

export type VideoChannel = {
  id: string
  handle: string
  name: string
  /** Короткая подпись на карточке. */
  label: string
}

export type Video = {
  id: VideoId
  kind: VideoKind
  title: string
  description: string
  channel: VideoChannel
  /** Дата и просмотры есть только в RSS; у ролика, найденного через oEmbed, их нет. */
  publishedAt: Date | null
  views: number | null
}
