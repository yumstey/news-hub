import { SITE_URL } from "@/shared/config"

export function absoluteUrl(path: string): string {
  return new URL(path, SITE_URL).toString()
}
