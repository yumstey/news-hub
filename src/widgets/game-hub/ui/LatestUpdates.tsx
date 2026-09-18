import Link from "next/link"

import { getGameUpdates, updateHref } from "@/entities/game-update"
import { ROUTES } from "@/shared/config"
import { cn } from "@/shared/lib/style"
import { pluralize } from "@/shared/lib/text"
import { SectionHeading } from "@/shared/ui/section-heading"

const dateFormat = new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long", timeZone: "UTC" })

export async function LatestUpdates({ limit = 3 }: { limit?: number }) {
  const result = await getGameUpdates()

  if (!result.ok || result.data.length === 0) return null

  return (
    <section className="flex flex-col gap-4">
      <SectionHeading
        title="Обновления игры"
        action={
          <Link href={ROUTES.updates} className="text-caption font-medium text-primary hover:underline">
            Все обновления
          </Link>
        }
      />
      <ul className="flex flex-col divide-y divide-border rounded-surface border border-border bg-surface">
        {result.data.slice(0, limit).map((update) => (
          <li key={update.id}>
            <Link
              href={updateHref(update.slug)}
              className="group flex items-center gap-3 px-4 py-3 transition-colors duration-150 hover:bg-muted/60"
            >
              <span
                aria-hidden="true"
                className={cn(
                  "size-2 shrink-0 rounded-full",
                  update.kind === "patch" ? "bg-primary" : "bg-rarity-gold",
                )}
              />
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-sm font-medium text-foreground group-hover:text-primary">
                  {/* Дата уже стоит справа — в узкой колонке полный заголовок патча обрезается. */}
                  {update.kind === "patch" ? "Патч CS2" : update.title}
                </span>
                <span className="truncate text-caption text-subtle-foreground">
                  {update.changeCount > 0
                    ? `${pluralize(update.changeCount, ["изменение", "изменения", "изменений"])}${update.sections.length > 0 ? ` · ${update.sections.slice(0, 3).join(", ")}` : ""}`
                    : update.excerpt}
                </span>
              </span>
              <time
                dateTime={update.publishedAt.toISOString()}
                className="shrink-0 text-overline uppercase tabular-nums text-subtle-foreground"
              >
                {dateFormat.format(update.publishedAt)}
              </time>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
