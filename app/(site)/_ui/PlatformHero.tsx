import Image from "next/image"

import { CS2 } from "@/shared/config"
import { Container } from "@/shared/ui/container"
import { Heading, Text } from "@/shared/ui/typography"

export function PlatformHero() {
  return (
    <div className="relative overflow-hidden border-b border-border bg-linear-to-br from-primary-soft via-elevated to-elevated">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-28 size-80 rounded-full bg-primary/15 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-primary/50 via-primary/15 to-transparent"
      />

      <Container className="relative flex flex-wrap items-center gap-5 py-8">
        <Image
          src={CS2.logo.url}
          alt={CS2.logo.alt}
          width={72}
          height={72}
          priority
          className="size-16 shrink-0 rounded-control object-cover ring-1 ring-border-strong"
        />
        <div className="flex min-w-0 flex-col gap-1.5">
          <Heading level={1} size="heading">
            {CS2.title}
          </Heading>
          <Text size="caption" tone="muted" className="max-w-content">
            {CS2.tagline}
          </Text>
        </div>
      </Container>
    </div>
  )
}

export function PlatformHeroSkeleton() {
  return (
    <div className="border-b border-border bg-elevated">
      <Container className="flex items-center gap-5 py-8">
        <div className="size-16 shrink-0 rounded-control bg-skeleton" />
        <div className="flex flex-col gap-2">
          <div className="h-7 w-full max-w-56 rounded-sm bg-skeleton" />
          <div className="h-4 w-full max-w-80 rounded-sm bg-skeleton" />
        </div>
      </Container>
    </div>
  )
}
