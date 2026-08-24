import Image from "next/image"

import type { ContentBlock } from "@/entities/article"
import { cn } from "@/shared/lib/style"
import { SkeletonText } from "@/shared/ui/skeleton"
import { Heading, Text } from "@/shared/ui/typography"

function ContentBlockView({ block }: { block: ContentBlock }) {
  switch (block.kind) {
    case "paragraph":
      return <Text size="lead">{block.text}</Text>

    case "heading":
      return (
        <Heading level={block.level} size={block.level === 2 ? "heading" : "subheading"} className="pt-2">
          {block.text}
        </Heading>
      )

    case "image":
      return (
        <figure className="flex flex-col gap-2">
          <div className="relative aspect-video w-full overflow-hidden rounded-surface bg-muted">
            <Image
              src={block.asset.url}
              alt={block.asset.alt}
              fill
              sizes="(min-width: 768px) 45rem, 100vw"
              className="object-cover"
            />
          </div>
          {block.caption ? (
            <figcaption>
              <Text size="caption" tone="subtle">
                {block.caption}
              </Text>
            </figcaption>
          ) : null}
        </figure>
      )

    case "quote":
      return (
        <figure className="border-l-2 border-primary pl-5">
          <blockquote>
            <Text size="lead" weight="medium">
              {block.text}
            </Text>
          </blockquote>
          {block.attribution ? (
            <figcaption className="pt-2">
              <Text size="caption" tone="subtle">
                {block.attribution}
              </Text>
            </figcaption>
          ) : null}
        </figure>
      )

    case "list":
      return block.ordered ? (
        <ol className="flex list-decimal flex-col gap-2 pl-6 text-lead marker:text-muted-foreground">
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
      ) : (
        <ul className="flex list-disc flex-col gap-2 pl-6 text-lead marker:text-muted-foreground">
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )

    case "embed":
      return (
        <a
          href={block.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col gap-1 rounded-surface border border-border bg-muted p-5 transition-colors duration-150 hover:border-border-strong"
        >
          <Text size="overline" tone="subtle">
            {block.provider}
          </Text>
          <Text weight="medium">{block.title ?? block.url}</Text>
        </a>
      )

    default: {
      const exhaustive: never = block
      return exhaustive
    }
  }
}

export type ArticleBodyProps = {
  blocks: readonly ContentBlock[]
  className?: string
}

export function ArticleBody({ blocks, className }: ArticleBodyProps) {
  return (
    <div className={cn("flex max-w-content flex-col gap-6", className)}>
      {blocks.map((block, index) => (
        <ContentBlockView key={`${block.kind}-${index}`} block={block} />
      ))}
    </div>
  )
}

export function ArticleBodySkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("flex max-w-content flex-col gap-6", className)}>
      <SkeletonText lines={4} />
      <SkeletonText lines={3} />
      <SkeletonText lines={5} />
    </div>
  )
}
