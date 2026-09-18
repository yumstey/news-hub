import type { Metadata } from "next"

import { DEFAULT_OG_IMAGE, SITE } from "@/shared/config"

export const NOT_FOUND_METADATA: Metadata = {
  title: "Страница не найдена",
  robots: { index: false, follow: false },
}

export type MetadataOptions = {
  /**
   * Обложка для соцсетей; по умолчанию — общая 1200×630. `"file"` — у сегмента
   * свой opengraph-image.tsx: картинку из конфига не задаём, иначе она его перекроет.
   */
  image?: { url: string; width: number; height: number; alt: string } | "file"
  type?: "website" | "article"
  publishedTime?: string
  /** Для отфильтрованных выдач: страницу видно, но в индекс она не идёт. */
  noindex?: boolean
  keywords?: string[]
}

export function buildMetadata(
  title: string,
  description: string,
  canonical: string,
  options: MetadataOptions = {},
): Metadata {
  const image = options.image ?? DEFAULT_OG_IMAGE
  const fromFile = image === "file"

  return {
    title,
    description,
    ...(options.keywords === undefined ? {} : { keywords: options.keywords }),
    alternates: { canonical },
    ...(options.noindex === true ? { robots: { index: false, follow: true } } : {}),
    openGraph: {
      type: options.type ?? "website",
      siteName: SITE.name,
      locale: "ru_RU",
      title,
      description,
      url: canonical,
      ...(fromFile ? {} : { images: [image] }),
      ...(options.publishedTime === undefined ? {} : { publishedTime: options.publishedTime }),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(fromFile ? {} : { images: [image.url] }),
    },
  }
}
