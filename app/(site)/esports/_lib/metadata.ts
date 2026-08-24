import type { Metadata } from "next"

import { DEFAULT_OG_IMAGE, ROUTES, SITE } from "@/shared/config"

export const ESPORTS_TITLE = "Киберспорт"

export const ESPORTS_DESCRIPTION =
  "Матчи, результаты, мировой рейтинг команд, составы и статистика игроков Counter-Strike 2."

export function generateMetadata(): Metadata {
  return {
    title: ESPORTS_TITLE,
    description: ESPORTS_DESCRIPTION,
    alternates: {
      canonical: ROUTES.esports,
    },
    openGraph: {
      type: "website",
      siteName: SITE.name,
      locale: "ru_RU",
      title: ESPORTS_TITLE,
      description: ESPORTS_DESCRIPTION,
      url: ROUTES.esports,
      images: [DEFAULT_OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: ESPORTS_TITLE,
      description: ESPORTS_DESCRIPTION,
      images: [DEFAULT_OG_IMAGE.url],
    },
  }
}
