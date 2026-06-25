# Hackathon Team Tools

A small Next.js app for forming up to 8 hackathon teams without full user accounts. Participants register a lightweight profile, propose ideas, join or leave one team, comment, and organizers can freeze formation or export CSVs.

## Setup

```bash
npm install
cp .env.example .env
npx prisma migrate dev
npx prisma db seed
npm run dev
```

Open http://localhost:3000.

## Admin password

Set `ADMIN_PASSWORD` in `.env`, then visit `/admin`. The password unlocks freeze/unfreeze, removal, delete, and CSV export controls.

## Reset SQLite

```bash
rm -f prisma/dev.db prisma/dev.db-journal
npx prisma migrate dev
npx prisma db seed
```

## Export teams

Visit `/admin`, enter the admin password, then use **Export teams CSV** or **Export participants CSV**.

## Limitations

This app is intentionally lightweight for a small internal hackathon. It stores a participant ID in browser local storage, does not use password accounts, has simple admin access, and is not intended for sensitive personal data or public multi-tenant use.
