import { getLiveCount } from "@/entities/match"

/** Счётчик матчей в эфире рядом с пунктом «Матчи»: сразу видно, что на сцене сейчас жарко. */
export async function LiveBadge() {
  const count = await getLiveCount()

  if (count === 0) return null

  return (
    <span className="inline-flex h-4 items-center gap-1 rounded-full bg-live px-1.5 text-[0.625rem] font-bold leading-none text-live-foreground">
      <span aria-hidden="true" className="size-1.5 animate-pulse rounded-full bg-live-foreground" />
      {count}
      <span className="sr-only"> в прямом эфире</span>
    </span>
  )
}
