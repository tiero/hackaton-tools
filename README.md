# Plan ₿ Hackathon — team formation app

A tiny team-formation app for the **Plan ₿ Summer School Hackathon** (29–30 June
2026, Lugano). Participants **pitch an idea** to lead a team, or **commit to join**
an existing one (one team each). Teams already matched offline can be registered as
**pre-formed** — public on the board, but not accepting new members.

Built to be **trivial to deploy on Cloudflare**: it's a single
[Hono](https://hono.dev) Worker rendering server-side HTML, backed by
[Cloudflare D1](https://developers.cloudflare.com/d1/) (serverless SQLite) via
[Drizzle ORM](https://orm.drizzle.team). No Next.js, no build server, no native
DB engine — `wrangler deploy` and you're live.

## Stack

- **Cloudflare Workers** + **Hono** (`hono/jsx` server-side rendering)
- **D1** (SQLite) + **Drizzle ORM**
- **Tailwind CSS** compiled to a static asset
- **TypeScript**, **pnpm**, **Wrangler**

## Features

- Idea board (`/`) with team size, needed skills, status (open/full/frozen), and
  a *Closed / pre-formed* marker for teams not taking new members.
- People directory (`/people`) — everyone registered, split into *on a team* and
  *not on a team yet*.
- Register / edit profile (`/join`, `/me`) — name, skills, contact; identity is a
  cookie-stored participant id, no passwords.
- Pitch an idea (`/ideas/new`) — capped at 8 teams; pitcher becomes owner and can
  mark the team *not joinable* (pre-formed).
- Idea detail (`/ideas/:id`) — commit to a team (one team max) or leave. Owner
  tools: edit the idea, set team size, add already-matched teammates by hand,
  toggle joinable, and delete the idea.
- Program page (`/about`) — schedule, judging, prizes, mentors, judges, team rules.
- Admin (`/admin`, password via `ADMIN_PASSWORD`) — freeze/unfreeze formation,
  delete ideas, remove members, export teams & participants as CSV.

## Local development

```bash
pnpm install
cp .dev.vars.example .dev.vars      # set ADMIN_PASSWORD for local

pnpm run db:apply:local             # create tables in the local D1
pnpm run db:seed:local              # optional demo data

pnpm run dev                        # builds CSS + `wrangler dev` on :8787
```

Open http://localhost:8787. The local D1 lives under `.wrangler/` (gitignored).
Reset it with `pnpm run db:reset:local`.

## Deploy to Cloudflare

See **[DEPLOY.md](./DEPLOY.md)**. Short version:

```bash
wrangler d1 create hackathon           # paste database_id into wrangler.toml
pnpm run db:apply:remote               # apply schema to remote D1
wrangler secret put ADMIN_PASSWORD     # set the admin password
pnpm run deploy                        # build CSS + wrangler deploy
```

Or connect the repo with **Workers Builds** for auto-deploy on push (DEPLOY.md).

## Intended limitations

This is a lightweight tool for ~30 people over two days, not production software:

- No real authentication — a participant is whoever holds the `pid` cookie.
- Admin is a single shared password.
- No email, no realtime, no payments. Non-custodial is a *judging* gate, not
  enforced by the app.

## Scripts

| Script | What it does |
| --- | --- |
| `pnpm run dev` | Build CSS, run `wrangler dev` (local D1) |
| `pnpm run build` | Compile Tailwind to `public/styles.css` |
| `pnpm run deploy` | Build CSS, `wrangler deploy` |
| `pnpm run typecheck` | `tsc --noEmit` |
| `pnpm run db:apply:local` / `:remote` | Apply `migrations/0001_init.sql` |
| `pnpm run db:seed:local` / `:remote` | Apply `seed.sql` |
| `pnpm run db:reset:local` | Drop + recreate the local D1 (empty) |
| `pnpm run db:reset:remote` | Drop + recreate the **production** D1 — wipes all data |

> **Start the production DB from zero** (e.g. to clear test data before opening
> registration): `pnpm run db:reset:remote`. It drops every table and re-applies
> the schema — no seed, so the board is empty. Destructive; `--remote` will ask
> you to confirm.
