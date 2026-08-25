import { ROUTES } from "@/shared/config"

import { buildMetadata } from "../../_lib/metadata"

export const MATCHES_TITLE = "Матчи CS2"
export const MATCHES_DESCRIPTION =
  "Расписание ближайших матчей Counter-Strike 2: время начала, формат серии, турнир и составы команд."

export function generateMetadata() {
  return buildMetadata(MATCHES_TITLE, MATCHES_DESCRIPTION, ROUTES.matches)
}
