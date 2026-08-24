import Image from "next/image"
import Link from "next/link"

import { categoryHref } from "@/entities/category/@x/article"
import { cn } from "@/shared/lib/style"
import { Card, CardBody, CardMedia } from "@/shared/ui/card"
import { Heading, Text } from "@/shared/ui/typography"

import { articleHref } from "../lib/articleHref"
import type { ArticlePreview } from "../model/article"
import { ArticleMeta } from "./ArticleMeta"

export type ArticleCardProps = {
  article: ArticlePreview
  featured?: boolean
  priority?: boolean
  className?: string
}

export function ArticleCard({
  article,
  featured = false,
  priority = false,
  className,
}: ArticleCardProps) {
  return (
    <Card as="article" interactive className={cn("relative h-full", className)}>
      <CardMedia aspect={featured ? "wide" : "video"}>
        <Image
          src={article.cover.url}
          alt={article.cover.alt}
          fill
          priority={priority}
          sizes={
            featured
              ? "(min-width: 1024px) 66vw, 100vw"
              : "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          }
          className="object-cover"
        />
      </CardMedia>

      <CardBody className={cn("gap-3", featured && "gap-4 p-6")}>
        <Link
          href={categoryHref(article.primaryCategory.slug)}
          className="relative z-10 inline-flex h-6 w-fit items-center rounded-full bg-primary-soft px-2.5 text-overline uppercase text-primary transition-colors duration-150 hover:bg-primary hover:text-primary-foreground"
        >
          {article.primaryCategory.title}
        </Link>

        <Heading level={3} size={featured ? "heading" : "subheading"}>
          <Link
            href={articleHref(article.primaryCategory.slug, article.slug)}
            className="after:absolute after:inset-0"
          >
            {article.title}
          </Link>
        </Heading>

        <Text size={featured ? "lead" : "caption"} tone="muted" clamp={featured ? 3 : 2}>
          {article.excerpt}
        </Text>

        <ArticleMeta
          author={article.author}
          publishedAt={article.timestamps.publishedAt}
          readingMinutes={article.readingMinutes}
          className="mt-auto pt-1"
        />
      </CardBody>
    </Card>
  )
}
