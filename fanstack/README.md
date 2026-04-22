# FanStack by CUENTO

A modular sports intelligence platform prototype built with Next.js, Supabase, and Tailwind CSS.

## Overview

FanStack is an executive command center for sports organizations. It surfaces performance intelligence across key areas — promotions, in-venue experience, ticketing, sponsorship, and more — through a modular, pluggable architecture.

This prototype includes:
- **Home Dashboard** — executive KPI summary, active modules, alerts feed, recommendations, upcoming event watchlist, and marketplace teaser
- **Promotions Module** — attendance lift, ROI, show rate, first-time fan tracking, benchmarks, fan acquisition cohorts
- **Experience Module** — live show element library, crowd reaction scoring, reaction timeline, venue benchmarks
- **Module Marketplace** — browse active and available modules, add new ones

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database & Auth | Supabase (Postgres + Auth) |
| Charts | Recharts |
| Icons | Lucide React |
| Deployment | Netlify |

---

## Project Structure

```
fanstack/
├── app/
│   ├── dashboard/          # Home dashboard
│   ├── promotions/         # Promotions module + [id] detail
│   ├── experience/         # Experience module + [id] detail
│   └── marketplace/        # Module marketplace
├── components/
│   ├── layout/             # AppLayout, PageHeader
│   └── ui/                 # KpiCard, AlertFeed, RecommendationPanel, ScoreBar, ModuleCard, EmptyState
├── lib/
│   ├── supabase.ts         # Browser client
│   ├── supabase-server.ts  # Server client
│   └── utils.ts            # Formatters, constants
├── types/
│   └── database.ts         # Full TypeScript types
└── supabase/
    └── schema.sql          # Complete schema + seed data
```

---

## Local Development Setup

### 1. Clone or unzip the project

```bash
cd fanstack
npm install
```

### 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be provisioned (~1 min)
3. Go to **Settings → API** and copy:
   - **Project URL** (`NEXT_PUBLIC_SUPABASE_URL`)
   - **anon public key** (`NEXT_PUBLIC_SUPABASE_ANON_KEY`)

### 3. Run the database schema and seed

1. In your Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Open `supabase/schema.sql` from this project
4. Paste the entire contents and click **Run**

This creates all tables and inserts all demo seed data in one step.

### 4. Configure environment variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 5. (Optional) Create demo users in Supabase Auth

Go to **Authentication → Users → Add User** in the Supabase dashboard and create:

| Email | Password |
|-------|----------|
| demo@fanstack.app | FanStack2024! |
| jordan@lakelandstorm.com | FanStack2024! |

> Note: The prototype currently does not enforce auth on routes — it uses the demo team ID directly. Auth is wired up and ready to enforce if you want to add middleware-based route protection.

### 6. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You'll be redirected to the dashboard automatically.

---

## Netlify Deployment

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial FanStack prototype"
git remote add origin https://github.com/your-org/fanstack.git
git push -u origin main
```

### 2. Connect to Netlify

1. Log in to [netlify.com](https://netlify.com)
2. Click **Add new site → Import an existing project**
3. Connect to your GitHub repository
4. Netlify will auto-detect the `netlify.toml` config

### 3. Set environment variables in Netlify

In Netlify → **Site settings → Environment variables**, add:

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key |

### 4. Deploy

Click **Deploy site**. The build command is `npm run build` and the publish directory is `.next`.

> Make sure you have the `@netlify/plugin-nextjs` plugin installed (it's in `netlify.toml`). Netlify will install it automatically.

### 5. Required Netlify plugin

If the build fails with a plugin error, run:

```bash
npm install -D @netlify/plugin-nextjs
```

Then redeploy.

---

## Supabase Configuration Notes

### Row Level Security (RLS)

For the prototype, RLS is **not required** — the app uses the anon key and reads all data freely. If you want to lock it down:

```sql
-- Enable RLS on all tables
alter table organizations enable row level security;
alter table teams enable row level security;
-- etc.

-- Allow anon read access (simplest for demo)
create policy "Allow anon read" on organizations for select using (true);
```

### Supabase Auth (optional enforcement)

To enforce login, add a `middleware.ts` to the root:

```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Add auth check here if needed
  return NextResponse.next()
}
```

---

## Demo Data Overview

The seed script (`supabase/schema.sql`) inserts:

| Table | Count |
|-------|-------|
| Organizations | 2 |
| Venues | 2 |
| Teams | 2 (Lakeland Storm, Riverside Surge) |
| Modules | 7 |
| Active team modules | 4 |
| Events | 14 (12 completed, 2 upcoming) |
| Promotions | 14 (12 completed, 2 planned) |
| Promotion metrics | 12 |
| Promotion benchmarks | 4 |
| Fan acquisition cohorts | 6 |
| Alerts | 8 |
| Recommendations | 6 |
| Show elements | 15 |
| Show element instances | 20 |
| Crowd reactions | 20 |
| Experience scores | 12 |
| Experience benchmarks | 8 |
| Game moments | 15 |

---

## Module Architecture

FanStack uses a modular architecture. Each module is registered in the `modules` table and activated per team via `team_modules`. The platform shell (Home, Marketplace) is aware of which modules are active.

To add a new module:
1. Insert a row into the `modules` table
2. Create a new Next.js route under `app/[module-slug]/`
3. Link it from the sidebar in `components/layout/AppLayout.tsx`
4. Add it to the `moduleHref` map in `components/ui/ModuleCard.tsx`

---

## Design System

The app uses a dark, data-dense design system with:

- **Font**: DM Sans (display) + DM Mono (tabular)
- **Background**: `#0b0d14` (deep navy-black)
- **Surface**: `#111420` cards, `#0e1018` sidebar
- **Brand**: Indigo `#6366f1` primary, Cyan `#06b6d4` Experience accent, Violet for Promotions
- **Score colors**: Emerald ≥80, Yellow ≥65, Orange ≥50, Red <50

Key CSS classes defined in `globals.css`:
- `.card`, `.card-hover` — surface cards
- `.pill`, `.pill-success`, `.pill-warning`, etc. — status badges
- `.kpi-card`, `.stat-value`, `.stat-label` — KPI display
- `.data-table` — consistent table styling
- `.nav-link` — sidebar navigation
- `.btn-primary`, `.btn-secondary`, `.btn-ghost` — button variants

---

## Known Prototype Limitations

- Auth is wired up but not enforced on routes (demo-mode)
- The prototype is read-only — no create/edit forms are fully connected to the database
- Experience module uses seeded data; live control room / crowd sensing integrations are not included
- Only the Lakeland Storm team is seeded with full data; Riverside Surge is included as a second org for future comparison views

---

## Roadmap / Extension Ideas

- Add Supabase Auth middleware and login page
- Add create/edit forms for promotions and show elements
- Add a second team's data for head-to-head comparison
- Add Ticketing and Sponsorship modules
- Connect Experience module to real-time data (websockets via Supabase Realtime)
- Add CSV/PDF export for promotion reports
- Add mobile-responsive sidebar (drawer)

---

## Questions?

Contact your CUENTO representative or open an issue in the project repository.
