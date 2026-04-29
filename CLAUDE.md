# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server on :3000
npm run build    # Production build
npm run lint     # ESLint with Next.js rules
npm run start    # Run production build locally
```

No test framework is configured — there are no test files or test scripts.

## Environment Setup

Copy `.env.example` to `.env.local` and fill in:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=     # server-side only — never expose to client
NEXT_PUBLIC_APP_URL=
```

The database schema lives in `supabase-schema.sql` — run it in the Supabase SQL Editor to initialize a new project.

## Architecture

**PackedUp** is a Next.js 14 App Router application for collaborative group trip planning. Users create trips, invite friends via a 7-character code, vote on suggestions across three boards (Stay/Eat/Visit), and finalize an itinerary.

### Key design decisions

- **Guest-first**: Users can join trips without signing up. Guests are identified by a `session_token` (nanoid) stored in Zustand and persisted to localStorage. Full auth (Google OAuth + email) is optional.
- **Two Supabase clients**: `src/lib/supabase/client.ts` (browser, uses anon key) and `src/lib/supabase/server.ts` (SSR, reads cookies). Always use the server client in Route Handlers and Server Components.
- **`SUPABASE_SERVICE_ROLE_KEY` bypasses RLS** — only use it in server-side route handlers where you need elevated access.

### Data flow

```
Browser → src/lib/api.ts (typed fetch wrappers) → src/app/api/** (Route Handlers) → Supabase
```

Real-time vote/suggestion updates use Supabase Realtime subscriptions directly from the client (not via Route Handlers).

### State management

- **Zustand** (`src/lib/store.ts`): guest session (`member_id`, `trip_id`, `display_name`, `session_token`), current trip/member. Persisted to localStorage.
- **TanStack Query**: server state for trip details, suggestions, members, itinerary.

### Database schema (Supabase/PostgreSQL)

Tables: `users`, `trips`, `trip_members`, `suggestions`, `votes`, `itinerary_items`. RLS is enabled on all tables. Key constraints:
- `votes` has a unique constraint on `(suggestion_id, member_id)` — one vote per person per suggestion
- `trip_members.user_id` is nullable (guests have no user account)
- Cascade deletes are set up for data integrity

### API routes

| Route | Purpose |
|---|---|
| `POST /api/trips` | Create trip (auth required) |
| `GET /api/trips/code/[code]` | Look up trip by invite code (public) |
| `POST /api/members/join` | Guest or user joins via invite code |
| `GET /api/suggestions?trip_id=&board=` | List suggestions by board (stay/eat/visit) |
| `PATCH /api/suggestions/[id]/finalize` | Mark suggestion as winner |
| `POST /api/votes` / `DELETE /api/votes` | Cast or retract a vote |

### Path alias

`@/*` maps to `src/*` — use `@/components/...`, `@/lib/...`, etc.

### Styling conventions

- Light warm theme: background `#fffbf4` (cream), surface `#fff3e4`, orange accent `#ff8c42`, hover `#e8732e`
- Text: `#1a1a2e` (dark), muted `#8a6e5a`, borders `#e8d5c0`
- CSS variables: `--bg`, `--surface`, `--gold`, `--gold2`, `--white`, `--muted`, `--muted2`, `--border`, `--border2` — all defined in `globals.css`
- Tailwind utility classes; merge with `cn()` from `@/lib/utils` (clsx + tailwind-merge)
- Fonts: Playfair Display (serif headings, `--font-serif`) + Plus Jakarta Sans (body, `--font-sans`) + JetBrains Mono (labels/buttons, `--font-mono`) — loaded via `next/font/google` in `layout.tsx`
- Modal/picker backdrops use `rgba(26,26,46,0.7)` (dark overlay on light pages); page surfaces use `rgba(255,251,244,0.*)` 
- Buttons with gold background use white (`#fff`) text, not `var(--bg)`
- Animations via Framer Motion
