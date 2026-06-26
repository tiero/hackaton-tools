# Deploying to Cloudflare Pages + D1

This app is a Next.js (App Router) + Prisma project. Locally it runs on a SQLite
file. On Cloudflare it runs on **Pages** (via `@cloudflare/next-on-pages`) with
**D1** (Cloudflare's serverless SQLite) as the database.

> **Status / what's prepared vs. what needs you**
> - ✅ App + `wrangler.toml` are in the repo.
> - 🔑 **You must provide Cloudflare access**: either connect the repo in the
>   Pages dashboard (recommended — no token to share), or create a Cloudflare API
>   token so a CI/CLI deploy can run non-interactively.
> - 🔧 One code change remains (the D1 data-layer swap, step 4) — it's mechanical
>   and documented below. It's left out of the default build so local `pnpm dev`
>   keeps working on the file DB.

---

## Option A — Git-connected Pages (recommended, no token to share)

1. Push this repo to GitHub (needs write access — currently blocked, see top-level note).
2. Cloudflare dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
3. Pick `luganoplanb/hackaton-tools`, branch `claude/hackathon-website-setup-saa16p` (or `master`).
4. Build settings:
   - **Build command:** `pnpm dlx @cloudflare/next-on-pages@1`
   - **Build output directory:** `.vercel/output/static`
   - **Environment variable:** `ADMIN_PASSWORD` = (your choice)
5. After the first build, bind D1 (step 3 below) and redeploy.

Every push then auto-deploys. No API token leaves your machine.

## Option B — CLI / token deploy (non-interactive)

Provide a **Cloudflare API token** (permissions: *Account → Cloudflare Pages → Edit*
and *Account → D1 → Edit*) and your **account ID**. Then:

```bash
export CLOUDFLARE_API_TOKEN=...   # never commit this
export CLOUDFLARE_ACCOUNT_ID=...
pnpm add -D wrangler @cloudflare/next-on-pages
pnpm dlx @cloudflare/next-on-pages@1          # build
pnpm dlx wrangler pages deploy .vercel/output/static --project-name hackaton-tools
```

---

## 1. Install the Cloudflare toolchain

```bash
pnpm add -D wrangler @cloudflare/next-on-pages
pnpm add @prisma/adapter-d1
```

## 2. Create the D1 database

```bash
pnpm dlx wrangler d1 create hackathon
```

Copy the returned `database_id` into `wrangler.toml` (replace `REPLACE_WITH_D1_DATABASE_ID`).

## 3. Apply the schema + seed to D1

D1 uses plain SQL. The Prisma migration SQL is reused:

```bash
# schema
pnpm dlx wrangler d1 execute hackathon --remote \
  --file prisma/migrations/20260625165542_init/migration.sql
pnpm dlx wrangler d1 execute hackathon --remote \
  --file prisma/migrations/20260626160819_add_interest_and_open_to_join/migration.sql

# (optional) seed a couple of demo rows — see prisma/seed.ts for content
```

## 4. Point Prisma at D1 (the one remaining code change)

Prisma needs the D1 driver adapter and a per-request client (the D1 binding is
only available per request on the edge). The schema already needs the preview
flag:

```prisma
// prisma/schema.prisma
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["driverAdapters"]
}
```

Replace `lib/db.ts` with a dual-mode helper:

```ts
import { PrismaClient } from '@prisma/client';
import { PrismaD1 } from '@prisma/adapter-d1';

// Local dev: a file-backed singleton. Cloudflare: a per-request client bound to D1.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export function getPrisma(env?: { DB?: D1Database }) {
  if (env?.DB) return new PrismaClient({ adapter: new PrismaD1(env.DB) });
  return (globalForPrisma.prisma ??= new PrismaClient());
}

// Back-compat for local dev / scripts.
export const prisma = getPrisma();
```

On Cloudflare, get the binding per request via
`import { getRequestContext } from '@cloudflare/next-on-pages';` →
`getRequestContext().env.DB`, and pass it to `getPrisma(env)`. Add
`export const runtime = 'edge';` to each route/page that touches the DB.

> This step is deliberately **not** applied by default so local `pnpm dev` keeps
> working on the SQLite file. Apply it as part of wiring the Cloudflare build.

## 5. Bind D1 to the Pages project

Dashboard → your Pages project → **Settings → Functions → D1 bindings** →
add binding `DB` → database `hackathon`. (Or rely on `wrangler.toml`.)

## 6. Local preview against Miniflare (optional)

```bash
pnpm dlx @cloudflare/next-on-pages@1
pnpm dlx wrangler pages dev .vercel/output/static --d1 DB=hackathon
```

---

## Secrets

- `ADMIN_PASSWORD` — set in Pages **Settings → Environment variables** (Production
  and Preview). Never commit it.
- Never commit `CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ACCOUNT_ID`.
