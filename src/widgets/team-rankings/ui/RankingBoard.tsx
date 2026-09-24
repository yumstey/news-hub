"use client"

import { ChevronDown, ExternalLink, Loader2 } from "lucide-react"
import Link from "next/link"
import { useCallback, useEffect, useRef, useState } from "react"

import type { ValveRankDetails, ValveRegion } from "@/entities/team"
import { cn } from "@/shared/lib/style"
import { CountryTag } from "@/shared/ui/country-tag"
import { Logo } from "@/shared/ui/logo"

import { loadRankDetails, loadRankingPage } from "../api/rankingActions"
import type { RankingRowView } from "../model/rankingRow"

function Delta({ change }: { change: number | null }) {
  if (change === null) return <span className="w-10 shrink-0" />

  if (change === 0) {
    return (
      <span className="w-10 shrink-0 text-center text-caption text-subtle-foreground">
        <span aria-hidden="true">—</span>
        <span className="sr-only">без изменений</span>
      </span>
    )
  }

  const up = change > 0

  return (
    <span
      className={cn(
        "inline-flex w-10 shrink-0 items-center justify-center gap-0.5 text-caption font-semibold tabular-nums",
        up ? "text-success" : "text-danger",
      )}
    >
      <span className="sr-only">{up ? "поднялась на" : "опустилась на"}</span>
      <span aria-hidden="true">{up ? "▲" : "▼"}</span>
      {Math.abs(change)}
    </span>
  )
}

function Placeholder({ name }: { name: string }) {
  return (
    <span
      aria-hidden="true"
      className="flex size-12 shrink-0 items-center justify-center rounded-control bg-muted text-sm font-bold text-subtle-foreground"
    >
      {name.slice(0, 2).toUpperCase()}
    </span>
  )
}

function FactorBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-overline uppercase tracking-wider text-subtle-foreground">{label}</span>
        <span className="text-caption font-bold tabular-nums text-foreground">
          {Math.round(value * 100)}%
        </span>
      </div>
      <span aria-hidden="true" className="h-1.5 overflow-hidden rounded-full bg-muted">
        <span
          className="block h-full rounded-full bg-primary transition-[width] duration-500"
          style={{ width: `${Math.min(100, Math.max(2, value * 100))}%` }}
        />
      </span>
    </div>
  )
}

function Details({ details }: { details: ValveRankDetails }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-caption text-muted-foreground">
        {details.region === null ? null : (
          <span>
            Регион: <span className="font-semibold text-foreground">{details.region}</span>
            {details.regionalRank === null ? null : (
              <span className="font-semibold text-foreground"> · #{details.regionalRank}</span>
            )}
          </span>
        )}
        {details.rankValue === null ? null : (
          <span>
            Очки: <span className="font-semibold tabular-nums text-foreground">{details.rankValue}</span>
          </span>
        )}
      </div>

      {details.factors.length === 0 ? null : (
        <div className="grid gap-3 sm:grid-cols-2">
          {details.factors.map((factor) => (
            <FactorBar key={factor.label} label={factor.label} value={factor.value} />
          ))}
        </div>
      )}

      <a
        href={details.source}
        target="_blank"
        rel="noopener noreferrer external"
        className="inline-flex w-fit items-center gap-1.5 text-caption text-primary underline-offset-2 hover:underline"
      >
        Разбор очков Valve
        <ExternalLink aria-hidden="true" className="size-3" />
      </a>
    </div>
  )
}

function Row({
  row,
  region,
  open,
  onToggle,
}: {
  row: RankingRowView
  region: ValveRegion
  open: boolean
  onToggle: () => void
}) {
  const [details, setDetails] = useState<ValveRankDetails | null>(null)
  const [pending, setPending] = useState(false)
  const panelId = `rank-${row.rank}`

  // Разбор очков грузим по клику: строк в рейтинге сотни, запрос нужен только
  // для раскрытой.
  const toggle = (): void => {
    onToggle()

    if (open || details !== null || pending || row.details === null) return

    setPending(true)
    loadRankDetails(region, row.details)
      .then(setDetails)
      .finally(() => setPending(false))
  }

  return (
    <li className={cn("border-b border-border last:border-0", open && "bg-muted/40")}>
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex w-full cursor-pointer items-center gap-3 px-3 py-3 text-left transition-colors duration-150 hover:bg-muted/60 sm:gap-4 sm:px-4"
      >
        <span
          className={cn(
            "w-8 shrink-0 text-base font-bold tabular-nums sm:w-10",
            row.rank <= 3 ? "text-primary" : "text-foreground",
          )}
        >
          {row.rank}
        </span>

        {row.logo === null ? (
          <Placeholder name={row.name} />
        ) : (
          <Logo logo={row.logo} darkLogo={row.darkLogo} size={48} className="size-12 shrink-0" />
        )}

        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="truncate text-sm font-bold text-foreground">{row.name}</span>
          <span className="flex items-center gap-2 text-overline tracking-normal text-subtle-foreground">
            {row.country === null ? null : <CountryTag country={row.country} />}
            <span className="hidden truncate sm:inline">{row.roster.join(", ")}</span>
          </span>
        </span>

        <Delta change={row.change} />

        <span className="w-14 shrink-0 text-right text-sm font-bold tabular-nums text-foreground sm:w-20">
          {row.points}
        </span>

        <ChevronDown
          aria-hidden="true"
          className={cn(
            "size-4 shrink-0 text-subtle-foreground transition-transform duration-200",
            open && "rotate-180 text-primary",
          )}
        />
      </button>

      {open ? (
        <div id={panelId} className="flex animate-rise-in flex-col gap-4 px-4 pb-4 sm:px-5">
          {row.roster.length === 0 ? null : (
            <div className="flex flex-col gap-2">
              <span className="text-overline uppercase tracking-wider text-subtle-foreground">Состав</span>
              <ul className="flex flex-wrap gap-2">
                {row.roster.map((player) => (
                  <li
                    key={player}
                    className="inline-flex h-8 items-center rounded-full border border-border bg-surface px-3 text-caption font-medium text-foreground"
                  >
                    {player}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {pending ? (
            <span className="inline-flex items-center gap-2 text-caption text-subtle-foreground">
              <Loader2 aria-hidden="true" className="size-3.5 animate-spin" />
              Загружаем разбор очков…
            </span>
          ) : null}

          {details === null ? null : <Details details={details} />}

          {row.href === null ? null : (
            <Link
              href={row.href}
              className="inline-flex w-fit items-center gap-1.5 text-caption font-semibold text-primary hover:text-primary-hover"
            >
              Профиль команды, матчи и карты
            </Link>
          )}
        </div>
      ) : null}
    </li>
  )
}

export type RankingBoardProps = {
  region: ValveRegion
  initial: readonly RankingRowView[]
  total: number
  /** Сколько строк уже отдал сервер. */
  loaded: number
}

/**
 * Таблица рейтинга: строка раскрывается составом и разбором очков Valve,
 * следующая десятка подгружается при прокрутке до конца списка.
 */
export function RankingBoard({ region, initial, total, loaded }: RankingBoardProps) {
  const [rows, setRows] = useState<RankingRowView[]>([...initial])
  const [offset, setOffset] = useState(loaded)
  const [pending, setPending] = useState(false)
  const [exhausted, setExhausted] = useState(false)
  // Лидер раскрыт сразу: состав первой команды виден без клика.
  const [open, setOpen] = useState<number | null>(initial[0]?.rank ?? null)
  const sentinel = useRef<HTMLDivElement>(null)
  const done = exhausted || offset >= total

  const loadMore = useCallback(() => {
    if (pending || done) return

    setPending(true)
    loadRankingPage(region, offset)
      .then((next) => {
        if (next.length === 0) {
          setExhausted(true)
          return
        }

        setRows((current) => {
          const seen = new Set(current.map((entry) => entry.rank))

          return [...current, ...next.filter((entry) => !seen.has(entry.rank))]
        })
        setOffset((current) => current + next.length)
      })
      .finally(() => setPending(false))
  }, [pending, done, region, offset])

  useEffect(() => {
    const node = sentinel.current

    if (node === null || done) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) loadMore()
      },
      { rootMargin: "400px" },
    )

    observer.observe(node)

    return () => observer.disconnect()
  }, [loadMore, done])

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-hidden rounded-surface border border-border bg-surface">
        <ul>
          {rows.map((row) => (
            <Row
              key={`${row.rank}-${row.name}`}
              row={row}
              region={region}
              open={open === row.rank}
              onToggle={() => setOpen((current) => (current === row.rank ? null : row.rank))}
            />
          ))}
        </ul>
      </div>

      <div ref={sentinel} className="flex justify-center py-2">
        {pending ? (
          <span className="inline-flex items-center gap-2 text-caption text-subtle-foreground">
            <Loader2 aria-hidden="true" className="size-4 animate-spin" />
            Загружаем ещё команды…
          </span>
        ) : done ? (
          <span className="text-caption text-subtle-foreground">
            Показаны все {total} команд рейтинга
          </span>
        ) : (
          <button
            type="button"
            onClick={loadMore}
            className="inline-flex h-10 cursor-pointer items-center rounded-control border border-border bg-surface px-4 text-caption font-semibold text-foreground transition-colors duration-150 hover:border-border-strong hover:bg-muted"
          >
            Показать ещё
          </button>
        )}
      </div>
    </div>
  )
}
