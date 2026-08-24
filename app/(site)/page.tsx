import { SITE } from "@/shared/config"
import { Container, Section, Stack } from "@/shared/ui/container"
import { Heading, Text } from "@/shared/ui/typography"

export default function HomePage() {
  return (
    <Container>
      <Section spacing="lg">
        <Stack gap="md" className="max-w-content">
          <Heading level={1}>{SITE.name}</Heading>
          <Text size="lead" tone="muted">
            {SITE.description}
          </Text>
        </Stack>
      </Section>
    </Container>
  )
}
