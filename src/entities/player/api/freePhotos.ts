import { cacheTag } from "next/cache"
import { z } from "zod"

import { fetchJson, ok } from "@/shared/api"
import type { ApiResult } from "@/shared/api"
import { playerTag } from "@/shared/config"
import { cacheFor } from "@/shared/lib/cache"

const SPARQL = "https://query.wikidata.org/sparql?format=json&query="
const COMMONS = "https://commons.wikimedia.org/w/api.php"
const THUMB_WIDTH = 480
/** Commons отдаёт до 50 файлов за запрос — столько же берём игроков. */
const BATCH = 50

/**
 * Фото со свободной лицензией. Фотографии с Liquipedia брать нельзя: организаторы
 * (ESL, BLAST) дали разрешение только самой Liquipedia. Commons — единственный
 * бесплатный источник, где лицензия позволяет коммерческое использование.
 */
export type FreePhoto = {
  url: string
  author: string
  license: string
  source: string
  year: number | null
}

const ALLOWED_LICENSE = /^(cc0|cc by(-sa)? [\d.]+|public domain|pd)/i

const sparqlSchema = z.object({
  results: z.object({
    bindings: z.array(
      z.object({
        lp: z.object({ value: z.string() }),
        image: z.object({ value: z.string() }),
      }),
    ),
  }),
})

const imageInfoSchema = z.object({
  query: z
    .object({
      pages: z.array(
        z.object({
          title: z.string(),
          imageinfo: z
            .array(
              z.object({
                thumburl: z.string().optional(),
                descriptionurl: z.string().optional(),
                extmetadata: z.record(z.string(), z.object({ value: z.unknown() })).optional(),
              }),
            )
            .optional(),
        }),
      ),
    })
    .optional(),
})

function plain(value: unknown): string {
  return typeof value === "string"
    ? value.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim()
    : ""
}

/** Заголовок страницы Liquipedia: первая буква заглавная, остальное как в нике. */
function liquipediaId(nickname: string): string {
  return `counterstrike/${nickname.charAt(0).toUpperCase()}${nickname.slice(1)}`
}

function fileName(commonsUrl: string): string {
  return decodeURIComponent(commonsUrl.split("/").pop() ?? "").replace(/_/g, " ")
}

/** Свободные фото игроков по никам. Ключ результата — ник в нижнем регистре. */
export async function getFreePhotos(nicknames: readonly string[]): Promise<ApiResult<Record<string, FreePhoto>>> {
  "use cache"
  cacheTag(playerTag("free-photos"))

  const unique = [...new Set(nicknames.filter((nick) => /^[\w.-]{2,24}$/.test(nick)))].slice(0, BATCH)

  if (unique.length === 0) {
    cacheFor("reference", true)

    return ok({})
  }

  const values = unique.map((nick) => `"${liquipediaId(nick)}"`).join(" ")
  const query = `SELECT ?lp ?image WHERE { VALUES ?lp { ${values} } ?item wdt:P10918 ?lp ; wdt:P18 ?image . }`
  const found = await fetchJson(`${SPARQL}${encodeURIComponent(query)}`, sparqlSchema)

  if (!found.ok || found.data.results.bindings.length === 0) {
    // Нет фото в Wikidata — это тоже ответ, а вот сбой запроса перепроверим скоро.
    cacheFor("reference", found.ok)

    return ok({})
  }

  const byFile = new Map<string, string>()

  for (const row of found.data.results.bindings) {
    const nick = row.lp.value.replace(/^counterstrike\//, "").toLowerCase()

    if (!byFile.has(fileName(row.image.value))) byFile.set(fileName(row.image.value), nick)
  }

  const titles = [...byFile.keys()].map((file) => `File:${file}`).join("|")
  const info = await fetchJson(
    `${COMMONS}?action=query&prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=${THUMB_WIDTH}&format=json&formatversion=2&titles=${encodeURIComponent(titles)}`,
    imageInfoSchema,
  )

  cacheFor("reference", info.ok)

  if (!info.ok) return ok({})

  const photos: Record<string, FreePhoto> = {}

  for (const page of info.data.query?.pages ?? []) {
    const nick = byFile.get(page.title.replace(/^File:/, ""))
    const image = page.imageinfo?.[0]
    const meta = image?.extmetadata ?? {}
    const license = plain(meta.LicenseShortName?.value)

    if (nick === undefined || image?.thumburl === undefined || !ALLOWED_LICENSE.test(license)) continue

    const year = /\b(19|20)\d{2}\b/.exec(plain(meta.DateTimeOriginal?.value))?.[0]

    photos[nick] = {
      // Commons дописывает utm-метки; с ними оптимизатор Next отвечает 400.
      url: image.thumburl.split("?")[0] ?? image.thumburl,
      author: plain(meta.Artist?.value) || "Wikimedia Commons",
      license,
      source: image.descriptionurl ?? "https://commons.wikimedia.org",
      year: year === undefined ? null : Number(year),
    }
  }

  return ok(photos)
}

/**
 * Какое фото показать: у PandaScore чаще всего вырезанный портрет, но старый.
 * Свободное фото берём, если своего нет или оно заметно новее (год в имени файла).
 */
export function preferPhoto(
  pandaUrl: string | null,
  free: FreePhoto | undefined,
): { url: string; credit: FreePhoto | null } | null {
  if (free === undefined) return pandaUrl === null ? null : { url: pandaUrl, credit: null }
  if (pandaUrl === null) return { url: free.url, credit: free }

  const pandaYear = /(?:^|[_-])(20\d{2})(?:[_.-]|$)/.exec(pandaUrl.split("/").pop() ?? "")?.[1]

  if (pandaYear !== undefined && free.year !== null && free.year > Number(pandaYear)) {
    return { url: free.url, credit: free }
  }

  return { url: pandaUrl, credit: null }
}
