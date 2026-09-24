import { ROUTES } from "@/shared/config"

import { buildMetadata } from "../../_lib/metadata"

export const NEWS_TITLE = "Новости CS2"
export const NEWS_DESCRIPTION =
  "Новости Counter-Strike 2 на русском и английском: результаты турниров, трансферы, интервью, обновления рейтинга Valve и аналитика — из Cybersport.ru, HLTV и других изданий."

export function generateMetadata() {
  return buildMetadata(NEWS_TITLE, NEWS_DESCRIPTION, ROUTES.news)
}
