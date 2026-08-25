import Image from "next/image"
import Link from "next/link"
import { Suspense } from "react"

import { GlobalSearch } from "@/features/global-search"
import { CS2, ROUTES, SITE } from "@/shared/config"
import { Container } from "@/shared/ui/container"

import { SectionNav } from "./SectionNav"

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-sm">
      <Container className="flex h-14 items-center gap-3 sm:h-header sm:gap-4">
        <Link href={ROUTES.home} className="flex shrink-0 items-center gap-2.5 rounded-control">
          <Image
            src={CS2.logo.url}
            alt=""
            width={32}
            height={32}
            priority
            aria-hidden="true"
            className="size-8 shrink-0 rounded-sm object-cover"
          />
          <span className="hidden min-w-0 flex-col leading-tight sm:flex">
            <span className="truncate text-sm font-bold tracking-tight text-foreground">
              {SITE.name}
            </span>
            <span className="hidden truncate text-overline uppercase text-subtle-foreground lg:block">
              {CS2.tagline}
            </span>
          </span>
        </Link>

        <Suspense fallback={null}>
          <GlobalSearch className="ml-auto w-full max-w-56 sm:max-w-72 lg:max-w-80" />
        </Suspense>
      </Container>

      <SectionNav />
    </header>
  )
}
