import { Suspense } from "react"

import { Container } from "@/shared/ui/container"

import { ActiveSectionNav } from "./ActiveSectionNav"
import { SectionNavItems } from "./SectionNavItems"

export function SectionNav() {
  return (
    <div className="border-t border-border bg-elevated">
      <Container className="pb-0">
        <nav
          aria-label="Разделы"
          className="-mx-gutter overflow-x-auto px-gutter lg:mx-0 lg:px-0"
        >
          <ul className="flex w-max items-center gap-1">
            <Suspense fallback={<SectionNavItems />}>
              <ActiveSectionNav />
            </Suspense>
          </ul>
        </nav>
      </Container>
    </div>
  )
}
