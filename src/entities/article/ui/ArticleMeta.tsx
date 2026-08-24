import type { AuthorRef } from "@/entities/author/@x/article"
import { SITE } from "@/shared/config"
import { formatDate, toIsoDate } from "@/shared/lib/date"
import { cn } from "@/shared/lib/style"
import { Avatar } from "@/shared/ui/avatar"

export type ArticleMetaProps = {
  author: AuthorRef
  publishedAt: Date | null
  readingMinutes: number
  locale?: string
  showAvatar?: boolean
  className?: string
}

export function ArticleMeta({
  author,
  publishedAt,
  readingMinutes,
  locale = SITE.locale,
  showAvatar = true,
  className,
}: ArticleMetaProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-x-3 gap-y-2 text-caption text-muted-foreground", className)}>
      {showAvatar ? <Avatar name={author.name} src={author.avatar?.url} size="sm" /> : null}
      <span className="font-medium text-foreground">{author.name}</span>
      {publishedAt ? (
        <>
          <span aria-hidden="true">·</span>
          <time dateTime={toIsoDate(publishedAt)}>{formatDate(publishedAt, locale)}</time>
        </>
      ) : null}
      <span aria-hidden="true">·</span>
      <span>{readingMinutes} мин чтения</span>
    </div>
  )
}
