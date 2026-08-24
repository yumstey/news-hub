import Link from "next/link"

import { ROUTES } from "@/shared/config"
import { buttonClassName } from "@/shared/ui/button"
import { Container, Section, Stack } from "@/shared/ui/container"
import { Heading, Text } from "@/shared/ui/typography"

export default function NewsNotFound() {
  return (
    <Container>
      <Section spacing="lg">
        <Stack gap="md" className="max-w-content">
          <Text size="overline" tone="subtle">
            404
          </Text>
          <Heading level={1} size="title">
            Материал не найден
          </Heading>
          <Text size="lead" tone="muted">
            Возможно, публикация была удалена или адрес указан с ошибкой.
          </Text>
          <Link href={ROUTES.news} className={buttonClassName({ variant: "primary", className: "w-fit" })}>
            Ко всем новостям
          </Link>
        </Stack>
      </Section>
    </Container>
  )
}
