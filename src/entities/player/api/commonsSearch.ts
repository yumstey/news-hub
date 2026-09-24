import { z } from "zod"

import { fetchJson } from "@/shared/api"

import type { FreePhoto } from "./freePhotos"

const COMMONS = "https://commons.wikimedia.org/w/api.php"
const THUMB_WIDTH = 480
/** Больше пяти файлов на игрока смотреть бессмысленно: дальше идёт мусор. */
const HITS = 5

/**
 * Ник сам по себе слишком общий: «donk» находит деревню в Нидерландах. Файл
 * принимаем, только если в названии или описании есть киберспортивный след.
 */
const ESPORTS_MARKER =
  /(esport|e-sport|counter[- ]?strike|cs:?go|cs2|iem\b|blast\b|major\b|starladder|pgl\b|esl\b|dreamhack|katowice|cologne|intel extreme)/i

const searchSchema = z.object({
  query: z
    .object({
      pages: z
        .array(
          z.object({
            title: z.string(),
            imageinfo: z
              .array(
                z.object({
                  thumburl: z.string().optional(),
                  descriptionurl: z.string().optional(),
                  mime: z.string().optional(),
                  extmetadata: z.record(z.string(), z.object({ value: z.unknown() })).optional(),
                }),
              )
              .optional(),
          }),
        )
        .default([]),
    })
    .optional(),
})

const ALLOWED_LICENSE = /^(cc0|cc by(-sa)? [\d.]+|public domain|pd)/i

function plain(value: unknown): string {
  return typeof value === "string" ? value.replace(/<[^>]*>/g, "").trim() : ""
}

function matchesNickname(title: string, nickname: string): boolean {
  return new RegExp(`(^|[^a-z0-9])${nickname.toLowerCase().replace(/[.*+?^${}()|[\]\\-]/g, "\\$&")}([^a-z0-9]|$)`, "i").test(
    title.toLowerCase(),
  )
}

/**
 * Поиск свободной фотографии игрока прямо по Commons — для тех, кого нет в
 * Wikidata. Строгий фильтр важнее полноты: чужое фото хуже силуэта.
 */
export async function searchCommonsPhoto(nickname: string): Promise<FreePhoto | null> {
  const url =
    `${COMMONS}?action=query&generator=search&gsrsearch=${encodeURIComponent(`${nickname} counter-strike`)}` +
    `&gsrnamespace=6&gsrlimit=${HITS}&prop=imageinfo&iiprop=url|extmetadata|mime&iiurlwidth=${THUMB_WIDTH}` +
    `&format=json&formatversion=2`
  const result = await fetchJson(url, searchSchema)

  if (!result.ok) return null

  for (const page of result.data.query?.pages ?? []) {
    const image = page.imageinfo?.[0]
    const meta = image?.extmetadata ?? {}
    const license = plain(meta.LicenseShortName?.value)
    const description = plain(meta.ImageDescription?.value)
    const categories = plain(meta.Categories?.value)
    const haystack = `${page.title} ${description} ${categories}`

    if (image?.thumburl === undefined) continue
    if (image.mime !== undefined && !image.mime.startsWith("image/")) continue
    if (!ALLOWED_LICENSE.test(license)) continue
    if (!matchesNickname(page.title, nickname)) continue
    if (!ESPORTS_MARKER.test(haystack)) continue

    const year = /\b(19|20)\d{2}\b/.exec(`${plain(meta.DateTimeOriginal?.value)} ${page.title}`)?.[0]

    return {
      url: image.thumburl.split("?")[0] ?? image.thumburl,
      author: plain(meta.Artist?.value) || "Wikimedia Commons",
      license,
      source: image.descriptionurl ?? "https://commons.wikimedia.org",
      year: year === undefined ? null : Number(year),
    }
  }

  return null
}
