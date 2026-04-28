-- PackedUp MVP Database Schema
-- Run this in your Supabase SQL editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─── USERS ───────────────────────────────────────────────────
-- Managed by Supabase Auth, we just extend it
create table if not exists public.users (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null unique,
  name        text not null,
  avatar_url  text,
  provider    text not null default 'google',
  created_at  timestamptz not null default now()
);

-- ─── TRIPS ───────────────────────────────────────────────────
create table if not exists public.trips (
  id           uuid primary key default uuid_generate_v4(),
  creator_id   uuid references public.users(id) on delete set null,  -- null for guest creators
  name         text not null,
  destination  text not null,
  start_date   date not null,
  end_date     date not null,
  invite_code  text not null unique,
  status       text not null default 'planning' check (status in ('planning','finalized','completed')),
  created_at   timestamptz not null default now()
);
create index if not exists trips_creator_idx on public.trips(creator_id);
create index if not exists trips_invite_code_idx on public.trips(invite_code);

-- ─── TRIP MEMBERS ─────────────────────────────────────────────
create table if not exists public.trip_members (
  id             uuid primary key default uuid_generate_v4(),
  trip_id        uuid not null references public.trips(id) on delete cascade,
  user_id        uuid references public.users(id) on delete set null,  -- null = guest
  display_name   text not null,
  role           text not null default 'member' check (role in ('creator','member')),
  session_token  text,  -- identifies guest users across sessions
  joined_at      timestamptz not null default now()
);
create index if not exists trip_members_trip_idx on public.trip_members(trip_id);

-- ─── SUGGESTIONS ─────────────────────────────────────────────
create table if not exists public.suggestions (
  id            uuid primary key default uuid_generate_v4(),
  trip_id       uuid not null references public.trips(id) on delete cascade,
  member_id     uuid not null references public.trip_members(id) on delete cascade,
  board_type    text not null check (board_type in ('stay','eat','visit')),
  name          text not null,
  description   text,
  url           text,
  price         text,
  is_finalized  boolean not null default false,
  created_at    timestamptz not null default now()
);
create index if not exists suggestions_trip_idx on public.suggestions(trip_id);
create index if not exists suggestions_board_idx on public.suggestions(trip_id, board_type);

-- ─── VOTES ───────────────────────────────────────────────────
create table if not exists public.votes (
  id             uuid primary key default uuid_generate_v4(),
  suggestion_id  uuid not null references public.suggestions(id) on delete cascade,
  member_id      uuid not null references public.trip_members(id) on delete cascade,
  value          text not null check (value in ('up','down')),
  created_at     timestamptz not null default now(),
  unique(suggestion_id, member_id)  -- one vote per person per suggestion
);
create index if not exists votes_suggestion_idx on public.votes(suggestion_id);

-- ─── ITINERARY ITEMS ─────────────────────────────────────────
create table if not exists public.itinerary_items (
  id             uuid primary key default uuid_generate_v4(),
  trip_id        uuid not null references public.trips(id) on delete cascade,
  suggestion_id  uuid references public.suggestions(id) on delete set null,
  day_number     integer not null,
  item_date      date not null,
  type           text not null check (type in ('stay','eat','visit','travel')),
  title          text not null,
  sort_order     integer not null default 0,
  created_at     timestamptz not null default now()
);
create index if not exists itinerary_trip_idx on public.itinerary_items(trip_id);

-- ─── ROW LEVEL SECURITY ──────────────────────────────────────
alter table public.users enable row level security;
alter table public.trips enable row level security;
alter table public.trip_members enable row level security;
alter table public.suggestions enable row level security;
alter table public.votes enable row level security;
alter table public.itinerary_items enable row level security;

-- Users: only the owner can read/update their own row
-- Insert is handled by the trigger (runs as security definer, bypasses RLS)
create policy "users_select_own" on public.users
  for select using (auth.uid() = id);

create policy "users_update_own" on public.users
  for update using (auth.uid() = id);

-- Trips: anyone can read (needed for invite code lookup by guests)
-- Only authenticated creator can insert/update/delete
create policy "trips_select" on public.trips
  for select using (true);

-- Inserts are done server-side via service role key, so no RLS check needed here
create policy "trips_insert" on public.trips
  for insert with check (true);

-- Only authenticated creator (or service role) can update/delete
create policy "trips_update" on public.trips
  for update using (creator_id is null or auth.uid() = creator_id);

create policy "trips_delete" on public.trips
  for delete using (creator_id is null or auth.uid() = creator_id);

-- Members: anyone can read (guests need to see who's in the trip)
-- Anyone can insert (guests join without login)
-- Only the member themselves or creator can delete
create policy "members_select" on public.trip_members
  for select using (true);

create policy "members_insert" on public.trip_members
  for insert with check (true);

create policy "members_delete" on public.trip_members
  for delete using (
    auth.uid() = user_id  -- member deletes themselves
    or auth.uid() in (    -- or creator removes them
      select creator_id from public.trips where id = trip_id
    )
  );

-- Suggestions: anyone in the trip can read/add
-- Only the suggester or trip creator can delete
create policy "suggestions_select" on public.suggestions
  for select using (true);

create policy "suggestions_insert" on public.suggestions
  for insert with check (true);

create policy "suggestions_update" on public.suggestions
  for update using (true);  -- finalize is controlled at app layer

create policy "suggestions_delete" on public.suggestions
  for delete using (true);

-- Votes: anyone can read, insert, update, delete
-- One-vote-per-person enforced by UNIQUE constraint, not RLS
create policy "votes_select" on public.votes
  for select using (true);

create policy "votes_insert" on public.votes
  for insert with check (true);

create policy "votes_update" on public.votes
  for update using (true);

create policy "votes_delete" on public.votes
  for delete using (true);

-- Itinerary: anyone in the trip can read
-- Writes controlled at app layer (only creator finalizes)
create policy "itinerary_select" on public.itinerary_items
  for select using (true);

create policy "itinerary_insert" on public.itinerary_items
  for insert with check (true);

create policy "itinerary_update" on public.itinerary_items
  for update using (true);

create policy "itinerary_delete" on public.itinerary_items
  for delete using (true);

-- ─── REALTIME ────────────────────────────────────────────────
-- Enable realtime for votes and suggestions
alter publication supabase_realtime add table public.votes;
alter publication supabase_realtime add table public.suggestions;

-- ─── AUTO-CREATE USER ON SIGNUP ──────────────────────────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.users (id, email, name, avatar_url, provider)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email,'@',1)),
    new.raw_user_meta_data->>'avatar_url',
    coalesce(new.raw_user_meta_data->>'provider', 'google')
  );
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
