import {
  CalendarDays,
  LayoutDashboard,
  ListOrdered,
  Newspaper,
  Swords,
  Trophy,
  UserRound,
  Users,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"

import { DISCIPLINE_SECTIONS, disciplineSectionHref } from "@/entities/discipline"
import type { Discipline, DisciplineSection } from "@/entities/discipline"
import { cn } from "@/shared/lib/style"
import { Container } from "@/shared/ui/container"
import { Heading, Text } from "@/shared/ui/typography"

const sectionIcon: Record<DisciplineSection, React.ReactNode> = {
  overview: <LayoutDashboard className="size-4" />,
  news: <Newspaper className="size-4" />,
  matches: <Swords className="size-4" />,
  results: <ListOrdered className="size-4" />,
  rankings: <Trophy className="size-4" />,
  teams: <Users className="size-4" />,
  players: <UserRound className="size-4" />,
  events: <CalendarDays className="size-4" />,
}

export type DisciplineHeaderProps = {
  discipline: Discipline
  activeSection: DisciplineSection
  headingLevel?: 1 | 2
}

export function DisciplineHeader({
  discipline,
  activeSection,
  headingLevel = 2,
}: DisciplineHeaderProps) {
  return (
    <div className="border-b border-border bg-elevated">
      <div className="relative overflow-hidden border-b border-border bg-foreground/95">
        <Image
          src={discipline.logo.url}
          alt=""
          width={360}
          height={360}
          aria-hidden="true"
          className="pointer-events-none absolute -right-8 -top-12 size-56 rotate-6 object-contain opacity-15"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-linear-to-r from-foreground via-foreground/85 to-transparent"
        />

        <Container className="relative flex flex-wrap items-center gap-5 py-7">
          <Image
            src={discipline.logo.url}
            alt={discipline.logo.alt}
            width={72}
            height={72}
            priority
            className="size-16 shrink-0 rounded-control object-cover ring-1 ring-background/20"
          />
          <div className="flex min-w-0 flex-col gap-1">
            <Heading level={headingLevel} size="heading" className="text-background">
              {discipline.title}
            </Heading>
            <Text size="caption" className="max-w-content text-background/70">
              {discipline.description}
            </Text>
          </div>
        </Container>
      </div>

      <Container className="pb-0">
        <nav
          aria-label={`Разделы ${discipline.shortTitle}`}
          className="-mx-gutter overflow-x-auto px-gutter lg:mx-0 lg:px-0"
        >
          <ul className="flex w-max items-center gap-1">
            {DISCIPLINE_SECTIONS.map((entry) => {
              const active = entry.section === activeSection

              return (
                <li key={entry.section}>
                  <Link
                    href={disciplineSectionHref(discipline.slug, entry.section)}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "inline-flex h-11 items-center gap-2 whitespace-nowrap border-b-2 px-3 text-sm font-medium transition-colors duration-150",
                      active
                        ? "border-primary text-foreground"
                        : "border-transparent text-muted-foreground hover:border-border-strong hover:text-foreground",
                    )}
                  >
                    <span aria-hidden="true" className={active ? "text-primary" : undefined}>
                      {sectionIcon[entry.section]}
                    </span>
                    {entry.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      </Container>
    </div>
  )
}

export function DisciplineHeaderSkeleton() {
  return (
    <div className="border-b border-border bg-elevated">
      <div className="border-b border-border bg-foreground/95">
        <Container className="flex items-center gap-5 py-7">
          <div className="size-16 rounded-control bg-background/10" />
          <div className="flex flex-col gap-2">
            <div className="h-7 w-56 rounded-sm bg-background/10" />
            <div className="h-4 w-80 max-w-full rounded-sm bg-background/10" />
          </div>
        </Container>
      </div>
      <Container className="pb-0">
        <div className="h-11 w-full max-w-2xl rounded-sm bg-skeleton" />
      </Container>
    </div>
  )
}
