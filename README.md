# Hackathon Team Tools

A small Next.js app for forming up to 8 hackathon teams without full user accounts. Participants register a lightweight profile, propose ideas, join or leave one team, comment, and organizers can freeze formation or export CSVs.

Async team formation for the **Plan ₿ Summer School Hackathon** (29–30 June 2026,
Franklin University, Lugano). Participants register, **pitch an idea**, and can
**both lead a team and signal openness to join others** before kickoff.

## Setup

```bash
pnpm install
cp .env.example .env
pnpm exec prisma migrate dev
pnpm exec prisma db seed
pnpm dev
```

Open http://localhost:3000.

## Deploy

See **[DEPLOY.md](./DEPLOY.md)** for the Cloudflare Pages + D1 recipe.

## Admin password

Set `ADMIN_PASSWORD` in `.env`, then visit `/admin`. The password unlocks freeze/unfreeze, removal, delete, and CSV export controls.

## Reset SQLite

```bash
rm -f prisma/dev.db prisma/dev.db-journal
pnpm exec prisma migrate dev
pnpm exec prisma db seed
```

## Export teams

Visit `/admin`, enter the admin password, then use **Export teams CSV** or **Export participants CSV**.

## Limitations

This app is intentionally lightweight for a small internal hackathon. It stores a participant ID in browser local storage, does not use password accounts, has simple admin access, and is not intended for sensitive personal data or public multi-tenant use.
