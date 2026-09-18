import Image from "next/image"
import Link from "next/link"
import { Suspense } from "react"

import { getGameUpdates, updateHref } from "@/entities/game-update"
import { ROUTES, SITE_URL } from "@/shared/config"
import { buildCollectionPageJsonLd } from "@/shared/lib/seo"
import { cn } from "@/shared/lib/style"
import { pluralize } from "@/shared/lib/text"
import { Breadcrumbs } from "@/shared/ui/breadcrumbs"
import { Container, Section, Stack } from "@/shared/ui/container"
import { EmptyState } from "@/shared/ui/empty-state"
import { JsonLd } from "@/shared/ui/json-ld"
import { Skeleton } from "@/shared/ui/skeleton"
import { OnlineNow, SectionHero } from "@/widgets/game-hub"

import { buildMetadata } from "../_lib/metadata"
import { breadcrumbsJsonLd, trail } from "../_lib/breadcrumbs"

const TITLE = "Обновления CS2: патчноуты и изменения"
const DESCRIPTION =
  "Все обновления Counter-Strike 2 по датам: список изменений карт, оружия и геймплея из официальных патчноутов Valve, новые операции, кейсы и события."

const CRUMBS = trail({ label: "Обновления" })
const dateFormat = new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })

export function generateMetadata() {
  return buildMetadata(TITLE, DESCRIPTION, ROUTES.updates, {
    keywords: ["обновление cs2", "обновление кс2", "патч cs2", "патчноут cs2"],
  })
}

export default function Page() {
  return (
    <Container>
      <Section spacing="md">
        <Stack gap="lg">
          <JsonLd data={breadcrumbsJsonLd(CRUMBS)} />
          <Breadcrumbs items={CRUMBS} />

          <SectionHero
            scene="updates"
            title={TITLE}
            description={DESCRIPTION}
            aside={
              <Suspense fallback={null}>
                <OnlineNow />
              </Suspense>
            }
          />

          <Suspense fallback={<Skeleton variant="block" className="h-96 w-full" />}>
            <Timeline />
          </Suspense>
        </Stack>
      </Section>
    </Container>
  )
}

async function Timeline() {
  const result = await getGameUpdates()

  if (!result.ok) {
    return <EmptyState tone="danger" title="Обновления недоступны" description={result.error.message} />
  }

  if (result.data.length === 0) return <EmptyState title="Обновлений пока нет" />

  return (
    <>
      <JsonLd
        data={buildCollectionPageJsonLd({
          name: TITLE,
          description: DESCRIPTION,
          url: new URL(ROUTES.updates, SITE_URL).toString(),
          items: result.data.map((update) => ({
            name: update.title,
            url: new URL(updateHref(update.slug), SITE_URL).toString(),
          })),
        })}
      />
      <ol className="relative flex flex-col gap-3 border-l border-border pl-5 sm:pl-6">
        {result.data.map((update) => (
          <li key={update.id} className="relative">
            <span
              aria-hidden="true"
              className={cn(
                "absolute -left-[1.6rem] top-5 size-2.5 rounded-full ring-4 ring-background sm:-left-[1.85rem]",
                update.kind === "patch" ? "bg-primary" : "bg-rarity-gold",
              )}
            />
            <Link
              href={updateHref(update.slug)}
              className="group flex gap-4 rounded-surface border border-border bg-surface p-4 transition-all duration-200 hover:-translate-y-px hover:border-border-strong hover:shadow-surface"
            >
              {update.cover === null ? null : (
                <span className="relative hidden aspect-video w-40 shrink-0 overflow-hidden rounded-control bg-muted sm:block">
                  <Image src={update.cover} alt="" fill sizes="10rem" className="object-cover" />
                </span>
              )}
              <span className="flex min-w-0 flex-1 flex-col gap-1.5">
                <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-overline uppercase">
                  <time dateTime={update.publishedAt.toISOString()} className="tabular-nums text-subtle-foreground">
                    {dateFormat.format(update.publishedAt)}
                  </time>
                  <span className={update.kind === "patch" ? "text-primary" : "text-rarity-gold"}>
                    {update.kind === "patch" ? "Патч" : "Анонс"}
                  </span>
                  {update.changeCount === 0 ? null : (
                    <span className="text-subtle-foreground">
                      {pluralize(update.changeCount, ["изменение", "изменения", "изменений"])}
                    </span>
                  )}
                </span>
                <span className="text-subheading font-semibold text-foreground transition-colors duration-150 group-hover:text-primary">
                  {update.title}
                </span>
                {update.sections.length === 0 ? (
                  <span className="line-clamp-2 text-caption text-muted-foreground">{update.excerpt}</span>
                ) : (
                  <span className="flex flex-wrap gap-1">
                    {update.sections.slice(0, 6).map((section) => (
                      <span key={section} className="rounded-xs bg-muted px-1.5 py-0.5 text-overline text-muted-foreground">
                        {section}
                      </span>
                    ))}
                  </span>
                )}
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </>
  )
}
