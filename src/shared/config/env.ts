import { z } from "zod"

const publicEnvSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.url().default("http://localhost:3000"),
})

export const PUBLIC_ENV = publicEnvSchema.parse({
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
})

export type PublicEnv = z.infer<typeof publicEnvSchema>
