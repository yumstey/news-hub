import { ROUTES } from "@/shared/config"

import { buildMetadata } from "../../_lib/metadata"

export const STREAMS_TITLE = "Трансляции CS2"
export const STREAMS_DESCRIPTION =
  "Официальные трансляции турниров Counter-Strike 2: плеер прямо на странице, языковые версии эфира и ссылки на каналы организаторов."

export function generateMetadata() {
  return buildMetadata(STREAMS_TITLE, STREAMS_DESCRIPTION, ROUTES.streams)
}
