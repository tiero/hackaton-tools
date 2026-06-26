# Deploying to Cloudflare Workers + D1

This app is a single Hono Worker (server-side rendered) backed by D1. Deploying
is just `wrangler deploy` once D1 exists and `ADMIN_PASSWORD` is set. Two paths:

- **Option A — CLI deploy** (fastest; needs a Cloudflare API token or
  `wrangler login`).
- **Option B — Git-connected Workers Builds** (auto-deploys on every push;
  set up once in the dashboard).

Either way you do the D1 setup once (steps 1–3).

> **What needs *you* (Cloudflare account access):** creating the D1 database,
> setting the `ADMIN_PASSWORD` secret, and authorizing the deploy. Everything
> else is in this repo.

---

## 1. Create the D1 database

```bash
wrangler d1 create hackathon
```

Copy the returned `database_id` into **`wrangler.toml`**, replacing
`REPLACE_WITH_D1_DATABASE_ID`. Commit that change (Workers Builds reads it).

## 2. Apply the schema (and optional demo data) to remote D1

```bash
pnpm run db:apply:remote     # migrations/0001_init.sql
pnpm run db:seed:remote      # optional: a few demo rows (seed.sql)
```

## 3. Set the admin password

```bash
wrangler secret put ADMIN_PASSWORD
```

(For Workers Builds you can instead set it in the dashboard under the Worker's
**Settings → Variables and Secrets**.)

---

## Option A — CLI deploy

Authenticate once, then deploy:

```bash
wrangler login                 # interactive, OR:
export CLOUDFLARE_API_TOKEN=...  # token with Workers Scripts:Edit + D1:Edit
export CLOUDFLARE_ACCOUNT_ID=...

pnpm run deploy                # compiles Tailwind, then `wrangler deploy`
```

The deploy uploads the Worker and the `public/` assets (the compiled
`styles.css`). It prints the live `*.workers.dev` URL.

## Option B — Git-connected Workers Builds (auto-deploy on push)

1. Cloudflare dashboard → **Workers & Pages** → **Create** → **Workers** →
   **Connect to Git** (or, on an existing Worker, **Settings → Builds → Connect**).
2. Pick this repo and the branch `claude/hackathon-website-setup-saa16p`
   (or `master`).
3. Build settings:
   - **Build command:** `pnpm run build`  (compiles Tailwind → `public/styles.css`)
   - **Deploy command:** `npx wrangler deploy`  (usually the default)
4. The `DB` binding comes from `wrangler.toml` (needs the real `database_id`
   from step 1, committed).
5. Set **`ADMIN_PASSWORD`** as a secret in the Worker's **Settings → Variables
   and Secrets**.

Every push to the chosen branch then builds and deploys automatically. No API
token leaves your machine.

---

## Required Cloudflare API token (if you want a non-interactive / CLI deploy)

Create a token at **dash.cloudflare.com → My Profile → API Tokens → Create
Token → Custom token** with these permissions:

- **Account → Workers Scripts → Edit**
- **Account → D1 → Edit**
- (Account ID is on the dashboard's Workers overview page.)

Then `export CLOUDFLARE_API_TOKEN=…` and `CLOUDFLARE_ACCOUNT_ID=…` and run the
Option A commands. **Never commit the token.**

---

## Notes

- **Local vs remote D1 are separate.** `:local` commands hit the Miniflare D1
  under `.wrangler/`; `:remote` hit the real D1. Apply the migration to remote
  once (step 2).
- **Schema changes:** add a new `migrations/000N_*.sql` and run
  `pnpm run db:apply:remote` (D1 has no Prisma-style migrate; it's plain SQL).
- **Secrets:** `ADMIN_PASSWORD` is the only required secret. Set it for the
  deployed Worker; `.dev.vars` only covers local dev.
