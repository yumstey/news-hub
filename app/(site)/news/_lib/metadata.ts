import { ROUTES } from "@/shared/config"

import { buildMetadata } from "../../_lib/metadata"

export const NEWS_TITLE = "Новости CS2"
export const NEWS_DESCRIPTION =
  "Новости Counter-Strike 2: результаты матчей, трансферы, обновления рейтинга и аналитика."

export function generateMetadata() {
  return buildMetadata(NEWS_TITLE, NEWS_DESCRIPTION, ROUTES.news)
}
