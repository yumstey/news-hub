import { cn } from "@/shared/lib/style"
import { Card, CardBody, CardMedia } from "@/shared/ui/card"
import { Skeleton, SkeletonText } from "@/shared/ui/skeleton"

export type ArticleCardSkeletonProps = {
  featured?: boolean
  className?: string
}

export function ArticleCardSkeleton({ featured = false, className }: ArticleCardSkeletonProps) {
  return (
    <Card className={cn("h-full", className)}>
      <CardMedia aspect={featured ? "wide" : "video"}>
        <Skeleton variant="block" className="h-full rounded-none" />
      </CardMedia>
      <CardBody className={cn("gap-3", featured && "p-6")}>
        <Skeleton variant="text" className="h-5 w-24 rounded-full" />
        <Skeleton variant="text" className="h-6 w-4/5" />
        <SkeletonText lines={2} />
        <div className="flex items-center gap-3 pt-1">
          <Skeleton variant="circle" className="size-8" />
          <Skeleton variant="text" className="h-3 w-32" />
        </div>
      </CardBody>
    </Card>
  )
}

export type ArticleListItemSkeletonProps = {
  className?: string
}

export function ArticleListItemSkeleton({ className }: ArticleListItemSkeletonProps) {
  return (
    <div className={cn("flex gap-4", className)}>
      <Skeleton variant="text" className="size-6 shrink-0" />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <Skeleton variant="text" className="h-4 w-full" />
        <Skeleton variant="text" className="h-4 w-2/3" />
        <Skeleton variant="text" className="h-3 w-1/2" />
      </div>
    </div>
  )
}
