begin;
select plan(3);

select ok(
  exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'favorites'
  ),
  'favorites is included in supabase_realtime'
);

select ok(
  exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'binders'
  ),
  'binders is included in supabase_realtime'
);

select ok(
  exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'binder_cards'
  ),
  'binder_cards is included in supabase_realtime'
);

select * from finish();
rollback;
