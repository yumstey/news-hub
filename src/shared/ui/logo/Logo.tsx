import Image from "next/image"

import { cn } from "@/shared/lib/style"
import type { ImageAsset } from "@/shared/model"

export type LogoProps = {
  logo: ImageAsset
  darkLogo?: ImageAsset | null
  size?: number
  eager?: boolean
  className?: string
}

/** Логотип с подменой варианта под тёмную тему. Без привязки к сущности. */
export function Logo({
  logo,
  darkLogo = null,
  size = 40,
  eager = false,
  className,
}: LogoProps) {
  const shared = cn("shrink-0 object-contain", className)

  if (darkLogo === null) {
    return (
      <Image
        src={logo.url}
        alt={logo.alt}
        width={size}
        height={size}
        loading={eager ? "eager" : undefined}
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
        loading={eager ? "eager" : undefined}
        className={cn(shared, "dark:hidden")}
      />
      <Image
        src={darkLogo.url}
        alt=""
        aria-hidden="true"
        width={size}
        height={size}
        loading={eager ? "eager" : undefined}
        className={cn(shared, "hidden dark:block")}
      />
    </>
  )
}
