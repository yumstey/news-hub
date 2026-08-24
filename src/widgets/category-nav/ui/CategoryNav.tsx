import Link from "next/link"

import { CategoryChip, getNewsCategories } from "@/entities/category"
import { ROUTES } from "@/shared/config"
import { cn } from "@/shared/lib/style"

export type CategoryNavProps = {
  activeSlug?: string
  className?: string
}

export async function CategoryNav({ activeSlug, className }: CategoryNavProps) {
  const result = await getNewsCategories()

  if (!result.ok || result.data.length === 0) return null

  return (
    <nav
      aria-label="Рубрики новостей"
      className={cn("-mx-gutter overflow-x-auto px-gutter lg:mx-0 lg:px-0", className)}
    >
      <ul className="flex w-max items-center gap-2 py-1">
        <li>
          <Link
            href={ROUTES.news}
            aria-current={activeSlug === undefined ? "page" : undefined}
            className={cn(
              "inline-flex h-8 shrink-0 items-center whitespace-nowrap rounded-full border px-3 text-caption font-medium transition-colors duration-150",
              activeSlug === undefined
                ? "border-transparent bg-primary text-primary-foreground"
                : "border-border bg-surface text-muted-foreground hover:border-border-strong hover:text-foreground",
            )}
          >
            Все
          </Link>
        </li>
        {result.data.map((category) => (
          <li key={category.id}>
            <CategoryChip
              slug={category.slug}
              title={category.title}
              active={category.slug === activeSlug}
            />
          </li>
        ))}
      </ul>
    </nav>
  )
}

export function CategoryNavSkeleton({ className }: { className?: string }) {
  return <div className={cn("h-8 w-full max-w-md rounded-full bg-skeleton", className)} />
}
