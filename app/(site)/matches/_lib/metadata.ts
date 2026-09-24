import { ROUTES } from "@/shared/config"

import { buildMetadata } from "../../_lib/metadata"

export const MATCHES_TITLE = "Матчи CS2: расписание и live"
export const MATCHES_DESCRIPTION =
  "Матчи Counter-Strike 2 сегодня и в ближайшие дни: live-счёт и трансляции, важность матчей по рейтингу Valve, турниры, стадии и форматы серий. Время — по вашему часовому поясу."

export function generateMetadata() {
  return buildMetadata(MATCHES_TITLE, MATCHES_DESCRIPTION, ROUTES.matches)
}
