create table public.favorites (
  user_id uuid not null default auth.uid()
    references auth.users (id) on delete cascade,
  scryfall_id uuid not null,
  created_at timestamptz not null default now(),
  constraint favorites_pkey primary key (user_id, scryfall_id)
);

create index favorites_user_created_at_idx
  on public.favorites (user_id, created_at desc);

alter table public.favorites enable row level security;

revoke all on table public.favorites from public, anon, authenticated;
grant usage on schema public to authenticated;
grant select, insert, delete on table public.favorites to authenticated;

create policy "Users can read their own favorites"
  on public.favorites
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can add their own favorites"
  on public.favorites
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own favorites"
  on public.favorites
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);