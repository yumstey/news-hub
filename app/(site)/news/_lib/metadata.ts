import type { Metadata } from "next"

import { parseFeedSearchParams } from "@/entities/article"
import { DEFAULT_OG_IMAGE, ROUTES, SITE } from "@/shared/config"
import { buildFeedHref } from "@/shared/lib/url"

export const NEWS_TITLE = "Новости"

export const NEWS_DESCRIPTION =
  "Главные события дня: политика, экономика, общество, технологии и культура — коротко о важном и подробно о сложном."

export async function generateMetadata(props: PageProps<"/news">): Promise<Metadata> {
  const { page, tag, sort } = parseFeedSearchParams(await props.searchParams)
  const filtered = tag !== undefined || sort !== "latest"
  const canonical = filtered ? ROUTES.news : buildFeedHref(ROUTES.news, { page })
  const title = page > 1 ? `${NEWS_TITLE} — страница ${page}` : NEWS_TITLE

  return {
    title,
    description: NEWS_DESCRIPTION,
    alternates: {
      canonical,
    },
    robots: filtered ? { index: false, follow: true } : { index: true, follow: true },
    openGraph: {
      type: "website",
      siteName: SITE.name,
      locale: "ru_RU",
      title,
      description: NEWS_DESCRIPTION,
      url: canonical,
      images: [DEFAULT_OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: NEWS_DESCRIPTION,
      images: [DEFAULT_OG_IMAGE.url],
    },
  }
}
