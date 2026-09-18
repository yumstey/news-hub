import { ROUTES } from "@/shared/config"

import { buildMetadata } from "../../_lib/metadata"

export const CASES_TITLE = "Кейсы CS2: что выпадает, шансы и цены"
export const CASES_DESCRIPTION =
  "Все оружейные кейсы Counter-Strike 2: содержимое, шансы выпадения ножей и перчаток, актуальная цена кейса и оценка окупаемости открытия."

export function generateMetadata() {
  return buildMetadata(CASES_TITLE, CASES_DESCRIPTION, ROUTES.cases, {
    keywords: ["кейсы cs2", "что выпадает из кейса", "шансы кейсов кс2", "цена кейса cs2"],
  })
}
