import Image from "next/image"

import { cn } from "@/shared/lib/style"

export type ItemImageProps = {
  src: string | null
  alt: string
  /** Класс свечения вида `from-rarity-covert/25`. */
  glow: string
  sizes: string
  /** Над сгибом: грузить сразу, без ленивой загрузки. */
  eager?: boolean
  /** Главная картинка страницы (LCP): поднимаем приоритет сетевого запроса. */
  highPriority?: boolean
  className?: string
  imageClassName?: string
}

/** Картинка предмета на мягком свечении цвета редкости, как в инвентаре игры. */
export function ItemImage({
  src,
  alt,
  glow,
  sizes,
  eager = false,
  highPriority = false,
  className,
  imageClassName,
}: ItemImageProps) {
  return (
    <span className={cn("relative block overflow-hidden", className)}>
      <span
        aria-hidden="true"
        className={cn(
          "absolute inset-0 bg-radial-[at_50%_60%] via-transparent to-transparent",
          glow,
        )}
      />
      {src === null ? (
        <span
          aria-hidden="true"
          className="absolute inset-0 flex items-center justify-center text-heading font-bold text-border-strong"
        >
          ?
        </span>
      ) : (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          loading={eager || highPriority ? "eager" : undefined}
          fetchPriority={highPriority ? "high" : undefined}
          className={cn("object-contain p-[8%] drop-shadow-lg", imageClassName)}
        />
      )}
    </span>
  )
}
