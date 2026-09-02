# NMRH Room Cleanliness Ledger

A grading system for the dorm's room cleanliness checks.

- **Everyone** — anyone who opens the link sees every room's scores, 3-day
  cycle averages, pass/fail results, and monthly violation points
  straight away. No login needed, view only.
- **Admin** — a separate, unlisted sign-in page for entering grading
  rounds. Only admin accounts can add or change scores.

Built with React + Tailwind (responsive for desktop and mobile) and
Supabase for the database and the admin login. The site is a static
build, so it deploys for free on GitHub Pages.

## How the grading rules work

- **Criteria** (max 100 total): Cleanliness (40), Orderliness (30),
  Conduciveness to Learning (20), Overall Appearance (10), matching your
  original sheet.
- **Session** = one grading round: a date, a checker, and a score for
  every room.
- **Cycle** = every 3 sessions. A room's cycle average is the mean of its
  totals across those 3 sessions.
- **Fail** = a cycle average below 90. Each fail is one violation.
- **Monthly points** = violations in that calendar month x 5 points,
  tallied per room. (Room failed 3 times in a month -> 15 points.)

All of this is computed in the app from the raw scores, so the database
just stores rooms, sessions, and per-room entries, nothing needs to be
precalculated. Logic lives in `src/lib/gradingLogic.js`.

## 1. Set up Supabase (the database)

1. Go to supabase.com, create a free account and a new project.
2. In your project, open **SQL Editor -> New query**, paste in the full
   contents of `supabase/schema.sql`, and run it. This creates the
   `rooms`, `profiles`, `grading_sessions`, and `grading_entries` tables,
   seeds your 8 rooms (1, 2, 3, 4A, 4B, 5, 6, 8), and sets up row-level
   security so:
   - Anyone can read rooms, sessions, and scores, no login required.
   - Only logged-in admins can add or edit grading data.
3. Go to **Project Settings -> API** and copy your **Project URL** and
   **anon public key**. You'll need these in step 2 below.
4. Create your admin account (there is no public sign-up form on
   purpose):
   - In the Supabase dashboard, go to **Authentication -> Users -> Add
     user**. Set an email and password, and turn on **Auto Confirm
     User**.
   - Copy the new user's ID from the Users list, then in **SQL Editor**
     run:
     ```sql
     insert into profiles (id, full_name)
     values ('paste-the-user-id-here', 'Your Name');
     ```
     Or look it up by email instead of copying the ID:
     ```sql
     insert into profiles (id, full_name)
     select id, 'Your Name' from auth.users where email = 'you@example.com';
     ```
   - That email and password are now your admin login, on the site's
     `/admin-login` page (also reachable via the small "Admin" link in
     the top-right corner of the public page).

## 2. Run it locally

You'll need Node.js installed.

```bash
npm install
cp .env.example .env
```

Open `.env` and fill in the two values from Supabase step 1.3:

```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

Then:

```bash
npm run dev
```

Open the URL it prints (usually `http://localhost:5173`). You'll land on
the public ledger. Click **Admin** in the top-right to sign in.

## 3. Deploy for free on GitHub Pages

1. Create a new GitHub repo and push this project to it:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```
   (`.env` is already in `.gitignore`, so your Supabase keys won't be
   committed. The anon key is safe to expose in the built site itself,
   Supabase is designed for that, and RLS is what actually keeps writes
   admin-only, not the secrecy of this key. Still good practice to keep
   it out of git history.)

2. Since GitHub Pages only serves static files with no `.env` support,
   the Supabase keys need to be baked in at build time. The simplest way:
   run the deploy command locally, where your `.env` already exists:
   ```bash
   npm run deploy
   ```
   This builds the site and pushes the `dist` folder to a `gh-pages`
   branch using the `gh-pages` package (already included).

3. In your GitHub repo, go to **Settings -> Pages**, and set the source to
   the `gh-pages` branch. Your site will be live at
   `https://YOUR_USERNAME.github.io/YOUR_REPO/`, and that's the link
   anyone in the dorm can open to see scores directly, no login needed.

4. Routing uses a hash-based router (`/#/`, `/#/admin-login`, etc.)
   specifically so it works on GitHub Pages without extra server
   configuration.

**Alternative:** if you'd rather not run `npm run deploy` locally every
time, Vercel is a good free alternative that deploys straight from GitHub
on every push and has a proper `.env` settings page, connect the repo at
vercel.com, add the two `VITE_SUPABASE_*` variables in its project
settings, and it builds and redeploys automatically.

## Project structure

```
src/
  lib/gradingLogic.js     cycle averaging, pass/fail, monthly points
  lib/useLedgerData.js    fetches rooms + sessions from Supabase
  lib/supabaseClient.js   Supabase client setup
  context/AuthContext.jsx admin session state
  pages/PublicLedger.jsx  public, no-login view of all rooms
  pages/RoomDetail.jsx    public, no-login view of one room's full history
  pages/AdminLogin.jsx    admin-only sign in (no public sign-up)
  pages/AdminDashboard.jsx    same room overview, plus grading entry link
  pages/GradeEntry.jsx        enter a grading round (admin only)
supabase/schema.sql       tables, seed rooms, RLS policies
```

## Adding your dorm logo

Drop your NMRH logo file into `public/` (e.g. `public/logo.png`) and swap
it in for the "NMRH" text in `src/components/Masthead.jsx`.
