import { ROUTES } from "@/shared/config"

import { buildMetadata } from "../../_lib/metadata"

export const TEAMS_TITLE = "Команды CS2"
export const TEAMS_DESCRIPTION =
  "Команды Counter-Strike 2, выступающие на текущих и ближайших турнирах: состав, матчи и результаты."

export function generateMetadata() {
  return buildMetadata(TEAMS_TITLE, TEAMS_DESCRIPTION, ROUTES.teams)
}
