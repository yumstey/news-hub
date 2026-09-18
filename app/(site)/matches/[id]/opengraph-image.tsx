import { getMatchById, MATCH_FORMAT_LABEL } from "@/entities/match"
import { formatDate } from "@/shared/lib/date"
import { OG_CONTENT_TYPE, OG_SIZE, ogImageResponse } from "@/shared/lib/og"

export const alt = "Матч CS2: счёт и карты"
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const result = /^[A-Za-z0-9-]+$/.test(id) ? await getMatchById(id) : null

  if (result === null || !result.ok) {
    return ogImageResponse({ eyebrow: "Матчи", title: "Матчи CS2 онлайн" })
  }

  const match = result.data
  const [first, second] = match.teams
  const live = match.status === "live"

  return ogImageResponse({
    eyebrow: live ? "Матч · LIVE" : "Матч",
    title: `${first.team.name} — ${second.team.name}`,
    subtitle: match.tournament.name,
    accent: live ? "#ef4444" : "#6d7dff",
    badge: `${MATCH_FORMAT_LABEL[match.format]} · ${formatDate(match.startsAt)}`,
    versus: {
      left: first.team.logo.url.startsWith("http") ? first.team.logo.url : null,
      right: second.team.logo.url.startsWith("http") ? second.team.logo.url : null,
      score: match.score === null ? null : `${match.score.side1}:${match.score.side2}`,
    },
  })
}
