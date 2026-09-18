import { ExternalLink } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Suspense } from "react"

import { getGameUpdateBySlug, getGameUpdates, updateHref } from "@/entities/game-update"
import type { UpdateBlock, UpdateListItem } from "@/entities/game-update"
import { ROUTES, SITE, SITE_URL } from "@/shared/config"
import { pluralize } from "@/shared/lib/text"
import { AdSlot } from "@/shared/ui/ad-slot"
import { Breadcrumbs } from "@/shared/ui/breadcrumbs"
import { Container, Section, Stack } from "@/shared/ui/container"
import { JsonLd } from "@/shared/ui/json-ld"
import { Skeleton } from "@/shared/ui/skeleton"
import { Heading, Text } from "@/shared/ui/typography"

import { buildMetadata, NOT_FOUND_METADATA } from "../../_lib/metadata"
import { breadcrumbsJsonLd, trail } from "../../_lib/breadcrumbs"

const dateFormat = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
})

async function resolveUpdateSlug(params: Promise<{ slug: string }>): Promise<string> {
  const { slug } = await params

  if (!/^\d{4}-\d{2}-\d{2}-\d{1,6}$/.test(slug)) notFound()

  return slug
}

export async function generateMetadata(props: PageProps<"/updates/[slug]">) {
  const { slug } = await props.params
  const result = await getGameUpdateBySlug(slug)

  if (!result.ok) return NOT_FOUND_METADATA

  const update = result.data
  const changes =
    update.changeCount === 0
      ? ""
      : `${pluralize(update.changeCount, ["изменение", "изменения", "изменений"])}`
  const sections = update.sections.length === 0 ? "" : `: ${update.sections.slice(0, 4).join(", ")}`

  return buildMetadata(
    update.title,
    update.kind === "patch"
      ? `Что изменилось в CS2 ${dateFormat.format(update.publishedAt)} — ${changes}${sections}. Полный список правок из патчноута Valve.`
      : `${update.originalTitle} — анонс Valve от ${dateFormat.format(update.publishedAt)}. ${update.excerpt}`,
    updateHref(update.slug),
    {
      type: "article",
      publishedTime: update.publishedAt.toISOString(),
      ...(update.cover === null ? {} : { image: { url: update.cover, width: 1200, height: 630, alt: update.title } }),
    },
  )
}

export default function Page(props: PageProps<"/updates/[slug]">) {
  return (
    <Container>
      <Section spacing="md">
        <Suspense fallback={<Skeleton variant="block" className="h-[40rem] w-full" />}>
          <UpdateView params={props.params} />
        </Suspense>
      </Section>
    </Container>
  )
}

function ListItems({ items, depth }: { items: readonly UpdateListItem[]; depth: number }) {
  return (
    <ul className={depth === 0 ? "flex flex-col gap-2" : "mt-1.5 flex flex-col gap-1.5 border-l border-border pl-4"}>
      {items.map((item, index) => (
        <li key={`${depth}-${index}`} className="flex flex-col">
          <span className="flex gap-2.5 text-body leading-relaxed text-foreground">
            <span
              aria-hidden="true"
              className={depth === 0 ? "mt-2.5 size-1.5 shrink-0 rounded-full bg-primary" : "mt-2.5 size-1 shrink-0 rounded-full bg-border-strong"}
            />
            <span className={depth === 0 ? undefined : "text-caption text-muted-foreground"}>{item.text}</span>
          </span>
          {item.children.length === 0 ? null : <ListItems items={item.children} depth={depth + 1} />}
        </li>
      ))}
    </ul>
  )
}

/** Короткий абзац перед списком — название карты или подраздела: показываем как подзаголовок. */
function isSubheading(block: UpdateBlock, next: UpdateBlock | undefined): boolean {
  return (
    block.kind === "paragraph" &&
    next?.kind === "list" &&
    block.text.length <= 32 &&
    !/[.!?:]$/.test(block.text)
  )
}

function Blocks({ blocks }: { blocks: readonly UpdateBlock[] }) {
  return (
    <div className="flex flex-col gap-4">
      {blocks.map((block, index) => {
        const key = `${block.kind}-${index}`

        switch (block.kind) {
          case "heading":
            return (
              <h2 key={key} className="mt-4 flex items-center gap-2.5 text-heading first:mt-0">
                <span aria-hidden="true" className="h-5 w-1 rounded-full bg-primary" />
                {block.text}
              </h2>
            )
          case "paragraph":
            return isSubheading(block, blocks[index + 1]) ? (
              <h3 key={key} className="mt-1 text-subheading text-foreground">
                {block.text}
              </h3>
            ) : (
              <p key={key} className="text-body leading-relaxed text-muted-foreground">
                {block.text}
              </p>
            )
          case "list":
            return <ListItems key={key} items={block.items} depth={0} />
          case "image":
            return (
              <span key={key} className="relative block aspect-video w-full overflow-hidden rounded-surface bg-muted">
                <Image src={block.src} alt="" fill sizes="(min-width: 768px) 45rem, 100vw" className="object-cover" />
              </span>
            )
          case "video":
            // Ролики Valve в анонсах — короткие зацикленные анимации без звука, как GIF.
            return (
              <video
                key={key}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                poster={block.poster ?? undefined}
                className="aspect-video w-full rounded-surface border border-border bg-muted object-cover"
              >
                {block.webm === null ? null : <source src={block.webm} type="video/webm" />}
                {block.mp4 === null ? null : <source src={block.mp4} type="video/mp4" />}
              </video>
            )
          case "table":
            return (
              <div key={key} className="overflow-x-auto rounded-surface border border-border">
                <table className="w-full border-collapse text-left text-caption">
                  <tbody>
                    {block.rows.map((row, rowIndex) => (
                      <tr
                        key={`${key}-${rowIndex}`}
                        className={row.header ? "bg-elevated" : "border-t border-border"}
                      >
                        {row.cells.map((cell, cellIndex) =>
                          row.header ? (
                            <th key={cellIndex} scope="col" className="px-3 py-2 text-overline uppercase text-subtle-foreground">
                              {cell}
                            </th>
                          ) : (
                            <td key={cellIndex} className="px-3 py-2 tabular-nums text-foreground">
                              {cell}
                            </td>
                          ),
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
        }
      })}
    </div>
  )
}

async function UpdateView({ params }: Pick<PageProps<"/updates/[slug]">, "params">) {
  const slug = await resolveUpdateSlug(params)
  const [result, all] = await Promise.all([getGameUpdateBySlug(slug), getGameUpdates()])

  if (!result.ok) {
    if (result.error.kind === "not-found") notFound()
    throw new Error(result.error.message)
  }

  const update = result.data
  const crumbs = trail({ label: "Обновления", href: ROUTES.updates }, { label: dateFormat.format(update.publishedAt) })
  const url = new URL(updateHref(update.slug), SITE_URL).toString()
  const others = (all.ok ? all.data : []).filter((entry) => entry.id !== update.id)
  const index = (all.ok ? all.data : []).findIndex((entry) => entry.id === update.id)
  const newer = index > 0 && all.ok ? all.data[index - 1] : undefined
  const older = all.ok && index >= 0 ? all.data[index + 1] : undefined

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <article className="flex min-w-0 flex-col gap-6">
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "NewsArticle",
            headline: update.title,
            datePublished: update.publishedAt.toISOString(),
            dateModified: update.publishedAt.toISOString(),
            mainEntityOfPage: url,
            url,
            inLanguage: "ru",
            ...(update.cover === null ? {} : { image: [update.cover] }),
            author: { "@type": "Organization", name: "Valve", url: "https://www.counter-strike.net" },
            publisher: { "@type": "Organization", name: SITE.name, url: SITE_URL },
            isBasedOn: update.sourceUrl,
          }}
        />
        <JsonLd data={breadcrumbsJsonLd(crumbs)} />
        <Breadcrumbs items={crumbs} />

        <header className="flex flex-col gap-3">
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-overline uppercase">
            <time dateTime={update.publishedAt.toISOString()} className="tabular-nums text-subtle-foreground">
              {dateFormat.format(update.publishedAt)}
            </time>
            <span className={update.kind === "patch" ? "text-primary" : "text-rarity-gold"}>
              {update.kind === "patch" ? "Патч" : "Анонс Valve"}
            </span>
            {update.changeCount === 0 ? null : (
              <span className="text-subtle-foreground">
                {pluralize(update.changeCount, ["изменение", "изменения", "изменений"])}
              </span>
            )}
          </span>
          <Heading level={1} size="title">
            {update.title}
          </Heading>
          {update.kind === "patch" && update.sections.length > 0 ? (
            <Text size="lead" tone="muted">
              В этом обновлении: {update.sections.join(", ").toLowerCase()}.
            </Text>
          ) : null}
        </header>

        <Blocks blocks={update.blocks} />

        <footer className="flex flex-col gap-4 border-t border-border pt-5">
          <Text size="caption" tone="subtle">
            Текст изменений опубликован Valve на английском языке и приведён без сокращений.{" "}
            <a
              href={update.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-primary hover:underline"
            >
              Оригинал в Steam
              <ExternalLink aria-hidden="true" className="size-3" />
            </a>
          </Text>

          <nav aria-label="Соседние обновления" className="grid gap-3 sm:grid-cols-2">
            {newer === undefined ? <span /> : (
              <Link href={updateHref(newer.slug)} className="flex flex-col gap-0.5 rounded-control border border-border p-3 transition-colors hover:border-border-strong">
                <span className="text-overline uppercase text-subtle-foreground">← Новее</span>
                <span className="text-caption font-medium text-foreground">{newer.title}</span>
              </Link>
            )}
            {older === undefined ? null : (
              <Link href={updateHref(older.slug)} className="flex flex-col gap-0.5 rounded-control border border-border p-3 text-right transition-colors hover:border-border-strong">
                <span className="text-overline uppercase text-subtle-foreground">Старее →</span>
                <span className="text-caption font-medium text-foreground">{older.title}</span>
              </Link>
            )}
          </nav>
        </footer>
      </article>

      <aside className="flex flex-col gap-4 lg:sticky lg:top-20 lg:self-start">
        <AdSlot slot="sidebar" />
        <Stack gap="sm">
          <span className="text-overline uppercase text-subtle-foreground">Другие обновления</span>
          <ul className="flex flex-col divide-y divide-border rounded-surface border border-border bg-surface">
            {others.slice(0, 8).map((entry) => (
              <li key={entry.id}>
                <Link href={updateHref(entry.slug)} className="flex flex-col gap-0.5 px-3 py-2.5 transition-colors hover:bg-muted/60">
                  <span className="text-caption tabular-nums text-subtle-foreground">
                    {dateFormat.format(entry.publishedAt)}
                  </span>
                  <span className="line-clamp-2 text-caption font-medium text-foreground">{entry.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Stack>
      </aside>
    </div>
  )
}
