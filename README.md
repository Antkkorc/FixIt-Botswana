# FixIt Botswana

FixIt Botswana is a React/Vite marketplace for discovering verified local service providers in Gaborone. The app uses Supabase Auth and Postgres for accounts, provider listings, quote requests, bookings, and reviews.

## Setup

Install Node.js 18 or newer, then run:

```bash
npm install
```

Copy `.env.example` to `.env.local` and set:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

In the Supabase Dashboard, open **SQL Editor** and run [supabase/schema.sql](supabase/schema.sql) once.

## Run locally

```bash
npm run dev
```

Open `http://localhost:5173`.

## Supabase configuration

In **Authentication > URL Configuration**, add the local URL and deployed Vercel URL. Enable Google under **Authentication > Providers** if Google sign-in is required.

Provider records should have `owner_id` set to the provider user's profile ID. This allows the provider dashboard to receive requests and update availability safely through row-level security.

## Vercel deployment

Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to the Vercel project for Production, Preview, and Development. The project builds with `npm run build` and outputs to `dist`.
