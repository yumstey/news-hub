import { cn } from "@/shared/lib/style"

export type SectionNavItem = {
  id: string
  label: string
}

export type SectionNavProps = {
  items: readonly SectionNavItem[]
  label: string
  className?: string
}

export function SectionNav({ items, label, className }: SectionNavProps) {
  if (items.length === 0) return null

  return (
    <nav
      aria-label={label}
      className={cn(
        "sticky top-header z-30 -mx-gutter border-b border-border bg-background/90 px-gutter backdrop-blur-sm lg:mx-0 lg:px-0",
        className,
      )}
    >
      <ul className="flex w-max items-center gap-1 overflow-x-auto">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className="inline-flex h-11 items-center whitespace-nowrap border-b-2 border-transparent px-3 text-sm font-medium text-muted-foreground transition-colors duration-150 hover:border-border-strong hover:text-foreground"
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
