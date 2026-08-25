import { ROUTES } from "@/shared/config"

import { buildMetadata } from "../../_lib/metadata"

export const RANKINGS_TITLE = "Мировой рейтинг CS2"
export const RANKINGS_DESCRIPTION =
  "Официальный глобальный рейтинг команд Counter-Strike 2 от Valve: место, очки и изменение позиции."

export function generateMetadata() {
  return buildMetadata(RANKINGS_TITLE, RANKINGS_DESCRIPTION, ROUTES.rankings)
}
