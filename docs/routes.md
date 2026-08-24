# Routes

## 1. Principle

The App Router is the pages layer (see [architecture.md](./architecture.md) §4.3). A `page.tsx` is a page slice expressed in Next.js convention: it resolves route params, composes widgets, and exports `generateMetadata`.

```tsx
import { ArticleBody } from '@/widgets/article-body'
import { ArticleSidebar } from '@/widgets/article-sidebar'

export { generateMetadata } from './_lib/metadata'

export default async function Page(props: PageProps<'/news/[slug]'>) {
  const { slug } = await props.params
  ...
}
```

Route-local helpers live in `_lib`. The leading underscore is Next.js's private-folder convention, which opts the folder out of routing. Anything a second route needs moves down into `widgets` or below.

## 2. Route groups

```
app/
  layout.tsx                        root layout — html, body, providers, metadataBase
  not-found.tsx
  global-error.tsx
  robots.ts
  sitemap.ts
  (site)/                           public site chrome: header, nav, footer
  (system)/                         system pages without site chrome
```

`(site)` and `(system)` are route groups and contribute nothing to the URL. They exist so the two families can have different layouts at the same URL depth.

## 3. Route table

### 3.1 Root

| Route | URL | Rendering |
| --- | --- | --- |
| `app/layout.tsx` | — | Server |
| `app/(site)/layout.tsx` | — | Server |
| `app/(site)/page.tsx` | `/` | Cached shell + streamed feeds |

### 3.2 News

| Route | URL | Notes |
| --- | --- | --- |
| `app/(site)/news/page.tsx` | `/news` | Feed. `?page`, `?tag`, `?sort` in search params. `CollectionPage` + `ItemList` JSON-LD |
| `app/(site)/news/[category]/page.tsx` | `/news/{category}` | Category feed. `CollectionPage` + `ItemList` JSON-LD |
| `app/(site)/news/[category]/[slug]/page.tsx` | `/news/{category}/{slug}` | `NewsArticle` + `BreadcrumbList` JSON-LD |

The category is part of the article permalink, so an article has exactly one canonical
URL derived from its primary category. `articleHref` in `entities/article/lib` owns that
mapping; a request whose `{category}` does not match the article's primary category calls
`notFound()` rather than serving a duplicate.

Pagination is server-rendered and URL-driven (`?page=N`), not a client fetch, so every
page of the feed is crawlable. TanStack Query stays reserved for interaction-only data
(see [architecture.md](./architecture.md) §6.2).

Under Cache Components every dynamic route streams a static shell first, so `notFound()`
inside a `<Suspense>` boundary cannot change the already-sent `200` status. The route
still renders the not-found UI and Next.js injects `noindex`, which keeps the soft 404 out
of the index. A real `404` status would require checking the slug in `proxy.ts` before the
response streams.

### 3.3 Sport

| Route | URL | Notes |
| --- | --- | --- |
| `app/(site)/sport/page.tsx` | `/sport` | Discipline index |
| `app/(site)/sport/[discipline]/page.tsx` | `/sport/{discipline}` | `football`, `basketball`, … |
| `app/(site)/sport/[discipline]/[slug]/page.tsx` | `/sport/{discipline}/{slug}` | `NewsArticle` JSON-LD |

### 3.4 Esports

CS2 is the first discipline, not a special case. The tree is parameterised so Dota and Valorant need no new routes.

| Route | URL | Notes |
| --- | --- | --- |
| `app/(site)/esports/page.tsx` | `/esports` | Discipline index + live block |
| `app/(site)/esports/[discipline]/page.tsx` | `/esports/cs2` | Hub. Static shell + streamed live block |
| `app/(site)/esports/[discipline]/news/page.tsx` | `/esports/cs2/news` | `article` repository, `module: 'esports'` |
| `app/(site)/esports/[discipline]/news/[slug]/page.tsx` | `/esports/cs2/news/{slug}` | `NewsArticle` JSON-LD |
| `app/(site)/esports/[discipline]/matches/page.tsx` | `/esports/cs2/matches` | Live scores uncached |
| `app/(site)/esports/[discipline]/matches/[id]/page.tsx` | `/esports/cs2/matches/{id}` | `SportsEvent` JSON-LD |
| `app/(site)/esports/[discipline]/results/page.tsx` | `/esports/cs2/results` | Finished matches, grouped by day |
| `app/(site)/esports/[discipline]/rankings/page.tsx` | `/esports/cs2/rankings` | `team` repository |
| `app/(site)/esports/[discipline]/teams/page.tsx` | `/esports/cs2/teams` | Team index |
| `app/(site)/esports/[discipline]/teams/[slug]/page.tsx` | `/esports/cs2/teams/{slug}` | `SportsTeam` JSON-LD |
| `app/(site)/esports/[discipline]/players/page.tsx` | `/esports/cs2/players` | Player index |
| `app/(site)/esports/[discipline]/players/[slug]/page.tsx` | `/esports/cs2/players/{slug}` | `Person` JSON-LD |
| `app/(site)/esports/[discipline]/events/page.tsx` | `/esports/cs2/events` | Tournament index |
| `app/(site)/esports/[discipline]/events/[slug]/page.tsx` | `/esports/cs2/events/{slug}` | `SportsEvent` JSON-LD |

The URL segment is `events`, the entity is `tournament`. The segment follows the term the
audience uses; the model keeps the name [data-model.md](./data-model.md) §4.5 gives it.

The section nav is rendered by `widgets/discipline-header`, which receives the active section
as a prop rather than reading the pathname. That keeps it a Server Component, so it appears in
the prerendered shell of every dynamic route in this subtree.

Live matches are the one uncached read in the project: `getLiveMatches` calls `connection()`
instead of `use cache`, so it never enters the shell and always streams behind its own
`<Suspense>` boundary. Everything else here uses `cacheLife('schedule')` or
`cacheLife('reference')`.

`[discipline]` is parsed with the shared `slugSchema` and then resolved through the `discipline`
repository. An unknown discipline calls `notFound()`, so `/esports/chess` renders the not-found UI
rather than an empty hub. A Zod enum was rejected because it would hard-code the discipline list in
the route layer, which is exactly what the parameterised tree exists to avoid.

CS2 sits under `/esports/{discipline}/` rather than at `/cs2/` so a second discipline needs no URL migration and no redirect layer.

### 3.5 System

| Route | URL | Notes |
| --- | --- | --- |
| `app/(site)/search/page.tsx` | `/search` | Reads `searchParams` — always dynamic, `noindex` |
| `app/not-found.tsx` | any unmatched | 404 |
| `app/(site)/error.tsx` | — | Client Component (React requirement) |
| `app/global-error.tsx` | — | Client Component, replaces root layout |

### 3.6 Machine endpoints

| Route | Method | Purpose |
| --- | --- | --- |
| `app/api/revalidate/route.ts` | `POST` | CMS webhook. Verifies a shared secret, then `revalidateTag` |
| `app/api/health/route.ts` | `GET` | Liveness |

## 4. Dynamic parameters

All request-time APIs are Promises in Next.js 16. Every route awaits them:

```tsx
export default async function Page(props: PageProps<'/news/[slug]'>) {
  const { slug } = await props.params
}
```

`PageProps`, `LayoutProps` and `RouteContext` are global helpers generated by `next typegen`, `next dev` or `next build`. They are not imported. With `typedRoutes: true`, the route literal is checked against the real route tree, so a renamed folder becomes a type error rather than a runtime 404.

## 5. Loading and error boundaries

| File | Placement | Why |
| --- | --- | --- |
| `loading.tsx` | Per route group | One shell per family; finer boundaries go inside the page where the streaming split actually is |
| `error.tsx` | `(site)` and `(system)` | Must be a Client Component; recovers the segment without losing the root layout |
| `not-found.tsx` | Root | Called explicitly by pages on unresolved slugs |

Under Cache Components the static shell renders before dynamic content arrives, so `loading.tsx` is the navigation fallback and inner `<Suspense>` boundaries carry the streaming.

## 6. Rules

1. `app/` imports from `@/widgets`, `@/features`, `@/entities`, `@/shared` and — in the root layout only — `@/app`. Nothing in `src/` imports from `app/`.
2. No route segment cache config (`dynamic`, `revalidate`, `fetchCache`, `dynamicParams`). Cache Components removed them; policy is set with `use cache` and `cacheLife` in the entity repositories.
3. Every dynamic route validates its params before use and calls `notFound()` on failure.
4. Route handlers exist only for machine callers. Pages never fetch from an internal route handler — that adds a network round trip to every server render and loses type safety at a boundary with no reason to exist.
5. New routes are added to `sitemap.ts` in the same change. See [seo.md](./seo.md).
