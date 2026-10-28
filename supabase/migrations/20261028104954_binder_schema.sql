create table public.binders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid()
    references auth.users (id) on delete cascade,
  name text not null
    check (length(btrim(name)) > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index binders_user_name_unique_idx
  on public.binders (user_id, lower(btrim(name)));

create table public.binder_cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid()
    references auth.users (id) on delete cascade,
  binder_id uuid references public.binders (id) on delete set null,
  scryfall_id uuid not null,
  rarity text not null
    check (length(btrim(rarity)) > 0),
  status text not null
    check (length(btrim(status)) > 0),
  acquisition_type text
    check (acquisition_type is null or length(btrim(acquisition_type)) > 0),
  acquisition_format text
    check (acquisition_format is null or length(btrim(acquisition_format)) > 0),
  condition text
    check (condition is null or length(btrim(condition)) > 0),
  finish text
    check (finish is null or length(btrim(finish)) > 0),
  language text
    check (language is null or length(btrim(language)) > 0),
  purchase_price numeric(10, 2)
    check (purchase_price is null or purchase_price >= 0),
  acquired_at timestamptz,
  location text,
  notes text,
  disposed_at timestamptz,
  disposal_price numeric(10, 2)
    check (disposal_price is null or disposal_price >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index binder_cards_user_created_at_idx
  on public.binder_cards (user_id, created_at desc, id);

create index binder_cards_binder_id_idx
  on public.binder_cards (binder_id);

create trigger binders_set_updated_at
  before update on public.binders
  for each row execute function public.set_updated_at();

create trigger binder_cards_set_updated_at
  before update on public.binder_cards
  for each row execute function public.set_updated_at();

alter table public.binders enable row level security;
alter table public.binder_cards enable row level security;

revoke all on table public.binders from public, anon, authenticated;
revoke all on table public.binder_cards from public, anon, authenticated;
grant usage on schema public to authenticated;

grant select, insert, delete on table public.binders to authenticated;
grant update (name) on table public.binders to authenticated;

grant select, insert, delete on table public.binder_cards to authenticated;
grant update (
  binder_id,
  rarity,
  status,
  acquisition_type,
  acquisition_format,
  condition,
  finish,
  language,
  purchase_price,
  acquired_at,
  location,
  notes,
  disposed_at,
  disposal_price
) on table public.binder_cards to authenticated;

create policy "Users can read their own binders"
  on public.binders
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can create their own binders"
  on public.binders
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own binders"
  on public.binders
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own binders"
  on public.binders
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can read their own binder cards"
  on public.binder_cards
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can create their own binder cards"
  on public.binder_cards
  for insert
  to authenticated
  with check (
    (select auth.uid()) = user_id
    and (
      binder_id is null
      or exists (
        select 1
        from public.binders
        where binders.id = binder_cards.binder_id
          and binders.user_id = (select auth.uid())
      )
    )
  );

create policy "Users can update their own binder cards"
  on public.binder_cards
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check (
    (select auth.uid()) = user_id
    and (
      binder_id is null
      or exists (
        select 1
        from public.binders
        where binders.id = binder_cards.binder_id
          and binders.user_id = (select auth.uid())
      )
    )
  );

create policy "Users can delete their own binder cards"
  on public.binder_cards
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);