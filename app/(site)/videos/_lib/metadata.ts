import { ROUTES } from "@/shared/config"

import { buildMetadata } from "../../_lib/metadata"

export const VIDEOS_TITLE = "Видео CS2: хайлайты и интервью"
export const VIDEOS_DESCRIPTION =
  "Свежие видео Counter-Strike 2 с официальных каналов BLAST, ESL и HLTV: хайлайты матчей, лучшие клатчи, интервью и короткие ролики."

export function generateMetadata() {
  return buildMetadata(VIDEOS_TITLE, VIDEOS_DESCRIPTION, ROUTES.videos)
}
