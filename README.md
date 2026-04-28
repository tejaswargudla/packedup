# PackedUp 🗺️
> Plan trips with friends. No more chaotic group chats.

## Tech Stack
- **Frontend + Backend**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS
- **Database + Auth + Realtime**: Supabase
- **State**: Zustand + TanStack Query
- **Animation**: Framer Motion
- **Hosting**: Vercel

---

## Local Setup (Step by Step)

### 1. Prerequisites
Make sure you have these installed:
```bash
node --version   # should be v18+
npm --version    # should be v9+
git --version
```

### 2. Clone & Install
```bash
git clone <your-repo-url>
cd packedup
npm install
```

### 3. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) → New Project
2. Give it a name (e.g. "packedup"), choose a region close to you
3. Wait ~2 minutes for it to spin up
4. Go to **SQL Editor** → paste the contents of `supabase-schema.sql` → Run
5. Go to **Settings → API** → copy:
   - Project URL
   - anon/public key
   - service_role key

### 4. Configure Environment
```bash
cp .env.example .env.local
```
Edit `.env.local` and paste your Supabase values:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. Enable Google Auth in Supabase
1. Supabase Dashboard → **Authentication → Providers → Google**
2. Enable it → add your Google OAuth credentials
3. (For local testing, you can use Supabase's built-in email auth instead)

### 6. Run Locally
```bash
npm run dev
```
Visit [http://localhost:3000](http://localhost:3000) 🎉

---

## Deploy to Vercel

```bash
# Push to GitHub first
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-github-repo>
git push -u origin main
```

Then:
1. Go to [vercel.com](https://vercel.com) → Import your GitHub repo
2. Add the same environment variables from `.env.local` into Vercel's dashboard
3. Change `NEXT_PUBLIC_APP_URL` to your Vercel URL
4. Click Deploy ✅

Every `git push` after this auto-deploys.

---

## Project Structure
```
src/
├── app/
│   ├── page.tsx                  # Home / Landing
│   ├── create/page.tsx           # Create trip
│   ├── join/[code]/page.tsx      # Join trip
│   ├── trip/[id]/
│   │   ├── page.tsx              # Dashboard
│   │   ├── created/page.tsx      # Share link
│   │   ├── board/page.tsx        # Voting boards
│   │   ├── add/page.tsx          # Add suggestion
│   │   └── itinerary/page.tsx    # Final itinerary
│   └── api/
│       ├── trips/route.ts        # Trip CRUD
│       ├── members/route.ts      # Join trip
│       ├── suggestions/route.ts  # Suggestions
│       ├── votes/route.ts        # Voting
│       └── itinerary/route.ts    # Itinerary
├── components/                   # Reusable UI
├── lib/
│   ├── supabase/                 # DB clients
│   ├── api.ts                    # API functions
│   ├── store.ts                  # Zustand state
│   └── utils.ts                  # Helpers
└── types/index.ts                # TypeScript types
```

---

## MVP Features
- ✅ Create a trip with shareable invite code
- ✅ Friends join with just their name (no login needed)
- ✅ Add suggestions to Stay / Eat / Visit boards
- ✅ Vote thumbs up/down on suggestions
- ✅ Creator finalizes winner → auto-builds itinerary
- ✅ Real-time vote updates via Supabase

## V1 Roadmap
- Google Places API for place search
- PDF itinerary export
- Push notifications / nudge system
- User accounts for friends
