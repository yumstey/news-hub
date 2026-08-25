import Image from "next/image"

import { cn } from "@/shared/lib/style"
import type { ImageAsset } from "@/shared/model"

export type TeamLogoProps = {
  logo: ImageAsset
  darkLogo?: ImageAsset | null
  size?: number
  priority?: boolean
  className?: string
}

export function TeamLogo({
  logo,
  darkLogo = null,
  size = 40,
  priority = false,
  className,
}: TeamLogoProps) {
  const shared = cn("shrink-0 object-contain", className)

  if (darkLogo === null) {
    return (
      <Image
        src={logo.url}
        alt={logo.alt}
        width={size}
        height={size}
        priority={priority}
        className={shared}
      />
    )
  }

  return (
    <>
      <Image
        src={logo.url}
        alt={logo.alt}
        width={size}
        height={size}
        priority={priority}
        className={cn(shared, "dark:hidden")}
      />
      <Image
        src={darkLogo.url}
        alt=""
        aria-hidden="true"
        width={size}
        height={size}
        priority={priority}
        className={cn(shared, "hidden dark:block")}
      />
    </>
  )
}
