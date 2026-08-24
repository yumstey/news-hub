# SEO

## 1. Why the rendering model is the SEO strategy

Crawlers index the HTML the server returns. Every architectural rule below exists to keep content in that HTML:

- Server Components by default, so content is in the response rather than assembled after hydration.
- TanStack Query restricted to post-interaction data, so nothing indexable depends on a client fetch.
- Cache Components streams uncached content into the same response, so a live score block does not force the whole page to be client-rendered.

A page whose primary content requires JavaScript to appear is an architecture bug.

## 2. Metadata

### 2.1 Where it is defined

| Level | File | Contents |
| --- | --- | --- |
| Root | `app/layout.tsx` | `metadataBase`, title template, default OG and Twitter, `robots` defaults |
| Group | `app/(site)/layout.tsx` | Site-wide overrides |
| Page | `app/(site)/**/page.tsx` | Exports `generateMetadata`, built in its `_lib` folder |

`metadata` and `generateMetadata` are Server-Component-only exports and cannot come from a Client Component. This is one more reason `page.tsx` stays a Server Component and pushes interactivity down.

A route exports either `metadata` or `generateMetadata` — never both.

### 2.2 The title template

The root layout sets:

```ts
title: {
  default: SITE.name,
  template: `%s — ${SITE.name}`,
}
```

Routes supply the bare title. They never repeat the site name.

### 2.3 `metadataBase`

Set once in the root layout from `shared/config`. Without it, relative OG and canonical URLs resolve against `localhost` in production builds. It is derived from an environment variable validated by Zod at startup, so a missing site URL fails the build rather than shipping broken tags.

### 2.4 Dynamic metadata

Every dynamic route builds metadata from the same data the page renders:

```ts
export async function generateMetadata(props: PageProps<'/news/[slug]'>): Promise<Metadata> {
  const { slug } = await props.params
  const article = await getArticleBySlug(slug)
  if (!article) return notFoundMetadata
  return buildArticleMetadata(article)
}
```

`buildArticleMetadata` is a pure function in the route's `_lib` folder. The repository call is deduplicated with `use cache`, so `generateMetadata` and the page component do not fetch twice.

`generateMetadata` resolving without dynamic behaviour puts metadata in the initial HTML. If it depends on request-time data it is streamed after the initial UI — correct for browsers, and Next.js serves the blocking form to crawler user agents.

## 3. Canonical URLs

Every page sets `alternates.canonical` to its absolute canonical path. This matters most where the same article is reachable through more than one path — a sport article under a discipline, or a filtered feed.

Rules:

| Case | Canonical |
| --- | --- |
| Article | Its own permalink |
| Feed page 1 | `/news` |
| Feed page N | `/news?page=N`, self-referencing |
| Filtered feed | The unfiltered feed |
| Search results | `/search`, plus `robots: { index: false }` |

Search result pages and any URL carrying user-supplied query state are marked `noindex, follow`.

## 4. `robots.ts`

`app/robots.ts` is generated, not static, so environments differ without a file swap:

- Production: allow crawling, point at the sitemap.
- Preview and development: `disallow: '/'`.

This is decided from the validated environment config, so a preview deployment cannot leak into an index.

Additionally disallowed in production: `/search`, `/api/`.

`robots.ts` is a Route Handler that Next.js caches unless it reads a request-time API. It reads none, so it is cached.

## 5. `sitemap.ts`

`app/sitemap.ts` emits:

| Group | Source | `changeFrequency` | `priority` |
| --- | --- | --- | --- |
| Static routes | Route constants in `shared/config` | `weekly` | 0.8 |
| News articles | `article` repository | `daily` | 0.7 |
| Sport articles | `article` repository | `daily` | 0.7 |
| Categories | `category` repository | `weekly` | 0.5 |
| CS2 tournaments | `tournament` repository | `weekly` | 0.6 |
| CS2 teams and players | `team`, `player` repositories | `monthly` | 0.4 |

`lastModified` comes from the entity's own timestamp, never `new Date()` — a sitemap that claims everything changed on every build is ignored.

### 5.1 Splitting

The 50 000-URL limit is reached by article volume before anything else. Past that, `generateSitemaps` splits by index. In Next.js 16 the `id` argument is a Promise:

```ts
export async function generateSitemaps() {
  return [{ id: 0 }, { id: 1 }]
}

export default async function sitemap({ id }: { id: Promise<string> }) {
  const start = Number(await id) * SITEMAP_CHUNK
}
```

Forgetting the `await` yields `NaN` offsets and a silently empty sitemap. This is a v16 breaking change.

## 6. JSON-LD

Rendered as a native `<script type="application/ld+json">` inside the page component. Not `next/script` — that component optimises loading of executable JavaScript, and structured data is neither.

### 6.1 Escaping

`JSON.stringify` does not sanitise strings for HTML embedding. Every payload passes through the project's serializer in `shared/lib/seo`, which replaces the `<` character with its Unicode escape (`<`) before the string reaches `dangerouslySetInnerHTML`:

```ts
JSON.stringify(jsonLd).replace(/</g, '\\u003c')
```

Article bodies are editor-supplied, so this is a live XSS vector, not a formality. No page calls `JSON.stringify` on a JSON-LD payload directly.

### 6.2 Schema per page

| Page | `@type` |
| --- | --- |
| Home | `WebSite` + `SearchAction`, `Organization` |
| News / sport article | `NewsArticle` with `author`, `datePublished`, `dateModified`, `image` |
| Category, feed | `CollectionPage` + `ItemList` |
| CS2 match | `SportsEvent` with `competitor`, `startDate` |
| CS2 tournament | `SportsEvent` with `subEvent` |
| CS2 team | `SportsTeam` |
| CS2 player | `Person` with `memberOf` |
| Any nested route | `BreadcrumbList` |

Builders live in each entity's `lib` segment and return typed objects. They take a domain model and return a graph node — no fetching, no framework imports, so they stay unit-testable.

`Organization` and `WebSite` are emitted once from the root layout. Everything else is per page.

## 7. Open Graph images

`opengraph-image.tsx` colocated with the routes that need a per-item image, using `ImageResponse`. Its `params` and `id` are Promises in v16.

Static fallback OG image at the root for routes without their own.

## 8. Checklist for a new route

1. `generateMetadata` exported from the route, with title, description, canonical, OG.
2. JSON-LD builder added and rendered, escaped.
3. Route added to `sitemap.ts` with a real `lastModified`.
4. Indexability decided — `noindex` if the URL carries user query state.
5. Breadcrumb JSON-LD if the route is nested.
6. `pnpm build` inspected: content present in the HTML, not only in the RSC payload.
