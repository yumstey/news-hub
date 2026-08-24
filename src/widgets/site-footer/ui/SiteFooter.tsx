import Link from "next/link"

import { FOOTER_NAV, ROUTES, SITE } from "@/shared/config"
import { Container, Stack } from "@/shared/ui/container"
import { Separator } from "@/shared/ui/separator"
import { Heading, Text } from "@/shared/ui/typography"

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-muted">
      <Container className="py-section">
        <div className="grid gap-10 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          <Stack gap="sm" className="max-w-narrow">
            <Link
              href={ROUTES.home}
              className="rounded-control text-subheading font-bold tracking-tight text-foreground"
            >
              {SITE.name}
            </Link>
            <Text size="caption" tone="muted">
              {SITE.description}
            </Text>
          </Stack>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {FOOTER_NAV.map((group) => (
              <Stack key={group.title} gap="sm">
                <Heading level={2} size="subheading" className="text-caption uppercase tracking-wider text-subtle-foreground">
                  {group.title}
                </Heading>
                <ul className="flex flex-col gap-2">
                  {group.items.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="rounded-control text-sm text-muted-foreground transition-colors duration-150 hover:text-foreground"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </Stack>
            ))}
          </div>
        </div>

        <Separator className="my-8" />

        <Text size="caption" tone="subtle">
          &copy; {SITE.name}. Все права защищены.
        </Text>
      </Container>
    </footer>
  )
}
