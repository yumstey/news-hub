import type { Metadata } from "next"

import { parseFeedSearchParams } from "@/entities/article"
import { categoryHref, getNewsCategoryBySlug } from "@/entities/category"
import { DEFAULT_OG_IMAGE, SITE } from "@/shared/config"
import { buildFeedHref } from "@/shared/lib/url"

import { parseCategoryParam } from "./params"

const NOT_FOUND_METADATA: Metadata = {
  title: "Рубрика не найдена",
  robots: { index: false, follow: false },
}

export async function generateMetadata(
  props: PageProps<"/news/[category]">,
): Promise<Metadata> {
  const { category } = await props.params
  const slug = parseCategoryParam(category)

  if (slug === null) return NOT_FOUND_METADATA

  const result = await getNewsCategoryBySlug(slug)

  if (!result.ok) return NOT_FOUND_METADATA

  const { page, tag, sort } = parseFeedSearchParams(await props.searchParams)
  const base = categoryHref(result.data.slug)
  const filtered = tag !== undefined || sort !== "latest"
  const canonical = filtered ? base : buildFeedHref(base, { page })
  const title =
    page > 1 ? `${result.data.seo.title} — страница ${page}` : result.data.seo.title

  return {
    title,
    description: result.data.seo.description,
    alternates: {
      canonical,
    },
    robots: filtered ? { index: false, follow: true } : { index: true, follow: true },
    openGraph: {
      type: "website",
      siteName: SITE.name,
      locale: "ru_RU",
      title,
      description: result.data.seo.description,
      url: canonical,
      images: [DEFAULT_OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: result.data.seo.description,
      images: [DEFAULT_OG_IMAGE.url],
    },
  }
}
