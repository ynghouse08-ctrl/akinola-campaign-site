# Akinola for Financial Secretary — Campaign Platform (Phase 1)

Landing page, student registration/login, GPA & CGPA calculator with saved
history, and a searchable transport price board.

## What's included (Phase 1 + Phase 2)
- Landing page with campaign branding, pillars, and countdown to election day
- Student registration (email + password, plus matric/JAMB number and other
  details) and login by **matric number or JAMB reg number** + password
- Dashboard: overview, GPA/CGPA calculator (with history + trend chart),
  transport price board (search), profile editing
- **Admin panel** (`/admin`): overview stats, duplicate-matric flagging,
  student list with search, promote/demote admin, block/unblock, delete
  account, and full transport price management (add/edit/delete routes)
- Admins see a "View as student" link to preview the normal dashboard, and
  students who are admins see an "Admin panel" link in their sidebar
- All routes under `/dashboard` and `/admin` require login; `/admin` also
  requires the `admin` role

**Not yet built** (later phases, as agreed): manifesto/FAQ page,
endorsements, share buttons, PWA install prompt, link preview image.

---

## 1. Set up Supabase (free)

1. Go to https://supabase.com → New project. Pick any name/region, save the
   database password somewhere safe.
2. Once created, go to **SQL Editor** → **New query**, paste the entire
   contents of `supabase/schema.sql` from this project, and click **Run**.
   This creates the tables, security rules, and seeds sample transport
   prices (marked as placeholders — update them with real fares).
3. Go to **Project Settings → API**. Copy:
   - **Project URL**
   - **anon public** key

## 2. Configure environment variables

Copy `.env.local.example` to `.env.local` and paste in the two values from
step 1:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## 3. Run locally (optional, to preview before deploying)

```
npm install
npm run dev
```

Visit http://localhost:3000

## 4. Deploy to Vercel

1. Push this folder to a GitHub repo (or use Vercel's "drag and drop" /
   `vercel` CLI upload if you prefer not to use GitHub).
2. On https://vercel.com → **Add New Project** → import the repo.
3. In the project's **Environment Variables** settings, add the same two
   `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` values.
4. Deploy. Vercel auto-detects Next.js — no extra config needed.

## 5. Make yourself the main admin

1. Register a normal account on the live site with your own matric number.
2. In Supabase → **SQL Editor**, run (replace with your real matric number):
   ```sql
   update public.profiles set role = 'admin'
   where matric_number = 'your-matric-number';
   ```
3. Log out and log back in. You'll be sent to `/admin` automatically, and
   from there you can promote/demote other admins, block or delete
   accounts, and manage transport prices — no more manual SQL needed after
   this one-time step for yourself.

## 6. About the service role key

Account deletion in the admin panel needs Supabase's **service role key**
(step 2's `.env` file has a line for it). This key bypasses all security
rules, so:
- Only ever put it in `.env.local` (ignored by git) or Vercel's environment
  variables — never in code you commit or share.
- It's only read by the one server-side file that needs it
  (`app/api/admin/delete-user/route.ts`) — it's never sent to the browser.

## How matric-number login works

Supabase Auth is built around email under the hood. To let students log in
with just their matric/JAMB number, the login page calls a database function
(`email_for_username`, created by `schema.sql`) that looks up the email tied
to that number, then signs in with it — invisibly to the student. Admins use
the same mechanism; after login, the app checks the `role` column on their
profile and sends them to `/admin` instead of `/dashboard`.

## Notes
- Grading scale used: A=5, B=4, C=3, D=2, E=1, F=0 (standard Nigerian
  university 5-point scale). Change this in `lib/grades.ts` if EKSU differs.
- Election countdown date lives in `lib/config.ts` (`ELECTION_DATE`) — update
  it to the real date.
- All campaign text (name, tagline, pillars, declaration) is centralized in
  `lib/config.ts` — edit there rather than hunting through pages.
