import { SITE } from "@/shared/config"
import { OG_CONTENT_TYPE, OG_SIZE, ogImageResponse } from "@/shared/lib/og"

export const alt = SITE.name
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function Image() {
  return ogImageResponse({
    eyebrow: "Матчи · статистика · скины",
    title: "Всё о CS2 в одном месте",
    subtitle: "Матчи онлайн, турнирные сетки, рейтинг команд, цены скинов и шансы кейсов",
    accent: "#6d7dff",
  })
}
