import { ChevronDown } from "lucide-react"

import { cn } from "@/shared/lib/style"
import { JsonLd } from "@/shared/ui/json-ld"
import { SectionHeading } from "@/shared/ui/section-heading"

export type FaqEntry = {
  question: string
  answer: string
}

export type FaqBlockProps = {
  title?: string
  entries: readonly FaqEntry[]
  className?: string
}

/**
 * Частые вопросы: закрывают информационные запросы («что такое float»)
 * и размечены FAQPage — Яндекс показывает такие ответы прямо в выдаче.
 */
export function FaqBlock({ title = "Частые вопросы", entries, className }: FaqBlockProps) {
  if (entries.length === 0) return null

  return (
    <section className={cn("flex flex-col gap-4", className)}>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: entries.map((entry) => ({
            "@type": "Question",
            name: entry.question,
            acceptedAnswer: { "@type": "Answer", text: entry.answer },
          })),
        }}
      />
      <SectionHeading title={title} />

      <div className="flex flex-col divide-y divide-border rounded-surface border border-border bg-surface">
        {entries.map((entry) => (
          <details key={entry.question} className="group px-4 py-3 open:bg-muted/40">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-foreground [&::-webkit-details-marker]:hidden">
              {entry.question}
              <ChevronDown
                aria-hidden="true"
                className="size-4 shrink-0 text-subtle-foreground transition-transform duration-200 group-open:rotate-180"
              />
            </summary>
            <p className="mt-2 text-caption leading-relaxed text-muted-foreground">{entry.answer}</p>
          </details>
        ))}
      </div>
    </section>
  )
}
