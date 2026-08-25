"use client"

import { useEffect } from "react"

import { Button } from "@/shared/ui/button"
import { Container, Section, Stack } from "@/shared/ui/container"
import { Heading, Text } from "@/shared/ui/typography"

export default function SiteError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <Container>
      <Section spacing="lg">
        <Stack gap="md" className="max-w-content">
          <Heading level={1} size="title">
            Не удалось загрузить раздел
          </Heading>
          <Text size="lead" tone="muted">
            Данные временно недоступны. Попробуйте обновить страницу.
          </Text>
          {error.digest ? (
            <Text size="caption" tone="subtle">
              Код ошибки: {error.digest}
            </Text>
          ) : null}
          <Button onClick={reset} className="w-fit">
            Попробовать снова
          </Button>
        </Stack>
      </Section>
    </Container>
  )
}
