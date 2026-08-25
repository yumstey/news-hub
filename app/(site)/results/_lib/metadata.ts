import { ROUTES } from "@/shared/config"

import { buildMetadata } from "../../_lib/metadata"

export const RESULTS_TITLE = "Результаты CS2"
export const RESULTS_DESCRIPTION =
  "Результаты сыгранных матчей Counter-Strike 2: счёт серии, турнир и стадия."

export function generateMetadata() {
  return buildMetadata(RESULTS_TITLE, RESULTS_DESCRIPTION, ROUTES.results)
}
