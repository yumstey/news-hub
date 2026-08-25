import Link from "next/link"

import { ROUTES } from "@/shared/config"
import { buttonClassName } from "@/shared/ui/button"
import { Container, Section, Stack } from "@/shared/ui/container"
import { Heading, Text } from "@/shared/ui/typography"

export default function SiteNotFound() {
  return (
    <Container>
      <Section spacing="lg">
        <Stack gap="md" className="max-w-content">
          <Text size="overline" tone="subtle">
            404
          </Text>
          <Heading level={1} size="title">
            Страница не найдена
          </Heading>
          <Text size="lead" tone="muted">
            Возможно, матч, команда или турнир были удалены, либо адрес указан с ошибкой.
          </Text>
          <Link href={ROUTES.home} className={buttonClassName({ variant: "primary", className: "w-fit" })}>
            На главную
          </Link>
        </Stack>
      </Section>
    </Container>
  )
}
