import { ROUTES } from "@/shared/config"

import { buildMetadata } from "../../_lib/metadata"

export const PLAYERS_TITLE = "Игроки CS2"
export const PLAYERS_DESCRIPTION =
  "Профили игроков Counter-Strike 2: команда, роль, страна и карьерные достижения."

export function generateMetadata() {
  return buildMetadata(PLAYERS_TITLE, PLAYERS_DESCRIPTION, ROUTES.players)
}
