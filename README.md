# Techneaux Project Estimator

Internal project estimation and quoting tool for Techneaux Technology Services. Analyzes historical ConnectWise data to generate phase-by-phase hour and cost estimates for service projects.

## Stack

- React 18 + Vite
- Supabase (auth + database)
- Vercel (hosting + auto-deploy)
- PWA (installable on mobile and desktop, auto-updates)

## Local Development

### 1. Prerequisites

- Node.js 18+
- A Supabase project (see below)

### 2. Clone and install

```bash
git clone https://github.com/TechneauxLA/business-assistant.git
cd techneaux-estimator
npm install --legacy-peer-deps
```

### 3. Environment variables

Copy `.env.example` to `.env.local` and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Find these in your Supabase project under **Settings → API**.

Never commit `.env.local` — it is already in `.gitignore`.

### 4. Set up the database

In your Supabase project, open the **SQL Editor** and paste the contents of `supabase_schema.sql`. Run it. This creates the `estimates` table with Row Level Security policies.

### 5. Run locally

```bash
npm run dev
```

App runs at `http://localhost:5173`.

## Deployment

### Vercel (auto-deploy on push)

1. Go to [vercel.com](https://vercel.com) and import the `TechneauxLA/business-assistant` GitHub repository.
2. Vercel detects Vite automatically. Leave build settings as-is (`vercel.json` handles everything).
3. Under **Settings → Environment Variables**, add:
   - `VITE_SUPABASE_URL` — your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` — your Supabase anon key
4. Click **Deploy**.

After the initial setup, every `git push` to `main` triggers an automatic redeploy. Users get the update silently on their next app launch via the service worker.

### Installing the app (PWA)

After deploying, visit the Vercel URL in any browser:

- **Mobile (iOS):** Share → Add to Home Screen
- **Mobile (Android):** browser prompts automatically, or Menu → Install App
- **Desktop (Chrome/Edge):** install icon in the address bar

The installed app behaves like a native app and updates automatically when a new version is deployed.

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_SUPABASE_URL` | Yes | Supabase project URL (`https://xxx.supabase.co`) |
| `VITE_SUPABASE_ANON_KEY` | Yes | Supabase public anon key (safe to expose in frontend) |

## Project Structure

```
src/
  components/     Shared UI components
  pages/          Route-level page components
  lib/            Supabase client, utilities
  data/           estimationEngine.json — benchmark data by project type
public/           Static assets, PWA icons
supabase_schema.sql   Run this in Supabase SQL Editor to create tables
vercel.json           Vercel deployment config (SPA rewrites, security headers)
```

## Demo Mode

If Supabase credentials are not configured, the app falls back to `localStorage` for saving estimates. This is useful for quick demos without a database.
