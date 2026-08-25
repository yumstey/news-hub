import "server-only"

import { z } from "zod"

const serverEnvSchema = z.object({
  PANDASCORE_API_URL: z.url().default("https://api.pandascore.co"),
  PANDASCORE_TOKEN: z.string().min(1, "PANDASCORE_TOKEN is required"),
})

export const SERVER_ENV = serverEnvSchema.parse({
  PANDASCORE_API_URL: process.env.PANDASCORE_API_URL,
  PANDASCORE_TOKEN: process.env.PANDASCORE_TOKEN,
})

export type ServerEnv = z.infer<typeof serverEnvSchema>
