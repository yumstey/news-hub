import { z } from "zod"

const optional = z.string().trim().default("")

const publicEnvSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.url().default("http://localhost:3000"),
  /** Реферальные коды маркетплейсов: попадают в ссылки «Купить». */
  NEXT_PUBLIC_SKINPORT_REF: optional,
  NEXT_PUBLIC_CSFLOAT_REF: optional,
  /** Коды подтверждения прав в Google Search Console и Яндекс Вебмастере. */
  NEXT_PUBLIC_GOOGLE_VERIFICATION: optional,
  NEXT_PUBLIC_YANDEX_VERIFICATION: optional,
  /** Почта для рекламодателей на странице «Реклама». */
  NEXT_PUBLIC_CONTACT_EMAIL: optional,
})

export const PUBLIC_ENV = publicEnvSchema.parse({
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_SKINPORT_REF: process.env.NEXT_PUBLIC_SKINPORT_REF,
  NEXT_PUBLIC_CSFLOAT_REF: process.env.NEXT_PUBLIC_CSFLOAT_REF,
  NEXT_PUBLIC_GOOGLE_VERIFICATION: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
  NEXT_PUBLIC_YANDEX_VERIFICATION: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
  NEXT_PUBLIC_CONTACT_EMAIL: process.env.NEXT_PUBLIC_CONTACT_EMAIL,
})

export type PublicEnv = z.infer<typeof publicEnvSchema>
