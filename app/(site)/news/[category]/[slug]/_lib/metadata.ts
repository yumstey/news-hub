import type { Metadata } from "next"

import { articleHref, getArticleBySlug } from "@/entities/article"
import { SITE } from "@/shared/config"

import { parseArticleParams } from "./params"

const NOT_FOUND_METADATA: Metadata = {
  title: "Материал не найден",
  robots: { index: false, follow: false },
}

export async function generateMetadata(
  props: PageProps<"/news/[category]/[slug]">,
): Promise<Metadata> {
  const params = parseArticleParams(await props.params)

  if (params === null) return NOT_FOUND_METADATA

  const result = await getArticleBySlug("news", params.slug)

  if (!result.ok) return NOT_FOUND_METADATA

  const article = result.data

  if (article.primaryCategory.slug !== params.category) return NOT_FOUND_METADATA

  const canonical = articleHref(article.primaryCategory.slug, article.slug)
  const image = article.seo.ogImage ?? article.cover
  const published = article.timestamps.publishedAt ?? article.timestamps.createdAt

  return {
    title: article.seo.title,
    description: article.seo.description,
    keywords: article.tags,
    authors: [{ name: article.author.name }],
    alternates: {
      canonical,
    },
    openGraph: {
      type: "article",
      siteName: SITE.name,
      locale: "ru_RU",
      title: article.seo.title,
      description: article.seo.description,
      url: canonical,
      publishedTime: published.toISOString(),
      modifiedTime: article.timestamps.updatedAt.toISOString(),
      authors: [article.author.name],
      tags: article.tags,
      section: article.primaryCategory.title,
      images: [
        {
          url: image.url,
          width: image.width,
          height: image.height,
          alt: image.alt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: article.seo.title,
      description: article.seo.description,
      images: [image.url],
    },
  }
}
