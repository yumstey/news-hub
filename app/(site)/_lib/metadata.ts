import type { Metadata } from "next"

import { DEFAULT_OG_IMAGE, SITE } from "@/shared/config"

export const NOT_FOUND_METADATA: Metadata = {
  title: "Страница не найдена",
  robots: { index: false, follow: false },
}

export function buildMetadata(
  title: string,
  description: string,
  canonical: string,
): Metadata {
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      siteName: SITE.name,
      locale: "ru_RU",
      title,
      description,
      url: canonical,
      images: [DEFAULT_OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [DEFAULT_OG_IMAGE.url],
    },
  }
}
