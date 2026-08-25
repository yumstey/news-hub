import { ROUTES } from "@/shared/config"

import { buildMetadata } from "../../_lib/metadata"

export const EVENTS_TITLE = "Турниры CS2"
export const EVENTS_DESCRIPTION =
  "Календарь турниров Counter-Strike 2: призовой фонд, даты, площадка, участники и итоговые таблицы."

export function generateMetadata() {
  return buildMetadata(EVENTS_TITLE, EVENTS_DESCRIPTION, ROUTES.events)
}
