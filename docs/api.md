# API layer

The contract between the application and the backend. No backend is connected yet; this defines what the `entities/*/api` segments will implement.

## 1. Two transports, one contract

| | Server | Client |
| --- | --- | --- |
| Implementation | Native `fetch` | Axios instance |
| Location | `shared/api/server` | `shared/api/client` |
| Consumers | `entities/*/api` repositories | `features/*/api` TanStack Query hooks |
| Caching | `use cache` + `cacheLife` + `cacheTag` | TanStack Query cache |
| Auth | Server-only secrets from `shared/config` | Public token only, if any |

### Why not one transport

Axios is not `fetch`. On the server that means no participation in the framework's request instrumentation and an unnecessary dependency in the server bundle for something the platform already provides. Native `fetch` is used there.

On the client, Axios earns its place: interceptors for auth and error normalisation, request cancellation, and progress — all of which would otherwise be hand-rolled around `fetch`.

The split is invisible above `entities/*/api` because both transports return the same `ApiResult<T>` (see [data-model.md](./data-model.md) §7) after the same Zod parse.

**Server code must never import `shared/api/client`, and vice versa.** `shared/api/server` carries `import 'server-only'` so a violation is a build error, not a runtime leak of API credentials into the browser bundle.

## 2. Request pipeline

```
caller
  → build URL from base + path + validated query
  → attach headers (auth, locale, request id)
  → transport (fetch | axios)
  → HTTP status check          → ApiError('http' | 'not-found')
  → JSON parse                 → ApiError('network')
  → Zod schema parse           → ApiError('contract')
  → domain mapper              → ApiResult.ok
```

Every stage has one failure mode and one error kind. No stage throws past its own boundary.

## 3. Repository pattern

Data access lives in `entities/*/api`, never in a component, a page or a route handler. A repository function is the only thing that knows a URL exists.

```
entities/article/api/
  articleSchema.ts       wire schema
  articleMapper.ts       wire → domain
  getArticleBySlug.ts    use cache, cacheTag, cacheLife
  getArticleFeed.ts
  index.ts
```

Rules:

1. One exported function per query. No generic `request(endpoint, options)` escape hatch — it defeats typing and tagging.
2. The function's arguments are the cache key, so they are serialisable primitives. No class instances, no functions, no `URL` objects.
3. The return type is `ApiResult<Domain>`, never the wire shape.
4. Read `cookies()` or `headers()` **outside** a `use cache` scope and pass the values in as arguments. Reading them inside is not allowed.

## 4. Caching with `use cache`

Cache Components is enabled (see [architecture.md](./architecture.md) §5.2), so nothing is cached unless it says so.

```ts
export async function getArticleBySlug(slug: string) {
  'use cache'
  cacheLife('article')
  cacheTag(articleTag(slug))
  ...
}
```

Cache keys are derived from the build ID, a hash of the function, and the serialised arguments. Variables captured from an enclosing scope are captured as arguments too — so a closure over a request-scoped value silently becomes part of the key. Repository functions are therefore top-level, never closures.

## 5. Cache profiles and tags

### 5.1 Profiles

Declared in `next.config.ts` under `cacheLife`, referenced by name:

| Profile | Applies to | Rationale |
| --- | --- | --- |
| `article` | Article bodies | Rarely edited after publish; long stale window, tag-invalidated on edit |
| `feed` | Listings, categories | Changes on each publish; short window, tag-invalidated |
| `reference` | Teams, players, tournaments, disciplines | Near-static |
| `schedule` | Scheduled and finished matches | Fixed once known |
| *(none)* | Live matches | Never cached — dynamic, streamed behind Suspense |

Live match data is the reason Cache Components is worth its constraints: the CS2 hub gets a cached shell with cached fixtures and an uncached live block, in one response, without splitting the route.

### 5.2 Tag scheme

```
article:{slug}          one article
article:module:{module} every article in news | sport | esports
category:{slug}
match:{id}
team:{slug}
player:{slug}
tournament:{slug}
feed:{module}
sitemap
```

Tag builders live in `shared/config` so producer and invalidator cannot drift apart on a string literal.

### 5.3 Invalidation

| Trigger | API | Why |
| --- | --- | --- |
| CMS publish / edit webhook | `revalidateTag(tag, 'max')` | Readers may see stale content briefly while it regenerates |
| Server Action mutating user-visible state | `updateTag(tag)` | Read-your-writes; the user must see their own change |

`revalidateTag` requires the second `cacheLife` argument in Next.js 16. The one-argument form is a TypeScript error.

A publish invalidates the article tag, its module feed tag, and `sitemap`.

## 6. Route handlers

`app/api/**/route.ts` exists only for machine callers:

| Route | Method | Purpose |
| --- | --- | --- |
| `/api/revalidate` | `POST` | CMS webhook. Verifies a shared secret, then calls `revalidateTag` |
| `/api/health` | `GET` | Liveness |

Pages never fetch from an internal route handler. A Server Component calling its own HTTP API adds a network round trip to every render and loses type safety at a boundary that has no reason to exist. Server Components call the repository directly.

`/api/*` is disallowed in `robots.ts`.

## 7. Client-side data

TanStack Query is configured in `src/app/lib` and used only in `features/*/api`.

| Feature | Query behaviour |
| --- | --- |
| `feed-pagination` | `useInfiniteQuery`, seeded with the server-rendered page 1 |
| `article-search` | Debounced, `enabled` gated on input length |
| `match-live-updates` | `refetchInterval` while `status === 'live'`, stopped otherwise |

Defaults: `staleTime` above zero so navigation does not refetch immediately, `retry` off for `contract` errors — a schema mismatch will not fix itself on retry.

Query keys mirror the tag scheme in §5.2, so the two caches stay mentally aligned.

TanStack Query is not used for initial page data. Restated here because it is the single easiest way to undo the SEO work in [seo.md](./seo.md).

## 8. Environment

Parsed once with Zod in `shared/config`, at module load:

| Variable | Scope | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | public | `metadataBase`, canonical URLs, sitemap |
| `NEXT_PUBLIC_API_URL` | public | Client transport base |
| `API_URL` | server | Server transport base |
| `API_TOKEN` | server | Server auth |
| `REVALIDATE_SECRET` | server | Webhook verification |

Only `NEXT_PUBLIC_`-prefixed variables reach the browser; unprefixed ones are replaced with an empty string in client bundles. That is a footgun, not a safeguard, so the server config module also carries `import 'server-only'`.

A missing or malformed variable throws at startup. Failing the build beats discovering a broken `metadataBase` in production OG tags.

## 9. When the backend arrives

1. Fill the wire schemas in `entities/*/api` from the real responses.
2. Write mappers to the domain shapes in [data-model.md](./data-model.md).
3. Attach `cacheLife` profiles and `cacheTag` per §5.
4. Wire the CMS webhook to `/api/revalidate`.
5. Fill `sitemap.ts` from the repositories.

Nothing above this layer changes.
