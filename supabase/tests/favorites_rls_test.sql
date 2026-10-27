begin;
select plan(18);

insert into auth.users (id, email)
values
  ('11111111-1111-1111-1111-111111111111', 'favorite-owner@example.com'),
  ('22222222-2222-2222-2222-222222222222', 'favorite-other@example.com');

insert into public.favorites (user_id, scryfall_id)
values (
  '22222222-2222-2222-2222-222222222222',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
);

select ok(
  not has_table_privilege(
    'anon',
    'public.favorites',
    'select, insert, update, delete'
  ),
  'anon has no table privileges'
);
select ok(
  has_table_privilege('authenticated', 'public.favorites', 'select'),
  'authenticated can select favorites'
);
select ok(
  has_table_privilege('authenticated', 'public.favorites', 'insert'),
  'authenticated can insert favorites'
);
select ok(
  has_table_privilege('authenticated', 'public.favorites', 'delete'),
  'authenticated can delete favorites'
);
select ok(
  not has_table_privilege('authenticated', 'public.favorites', 'update'),
  'authenticated cannot update favorites'
);
select ok(
  (select relrowsecurity from pg_class where oid = 'public.favorites'::regclass),
  'row level security is enabled'
);

set local role anon;
select throws_ok(
  $$select * from public.favorites$$,
  '42501',
  null,
  'anon cannot read favorites'
);
select throws_ok(
  $$insert into public.favorites (scryfall_id)
    values ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb')$$,
  '42501',
  null,
  'anon cannot insert favorites'
);
select throws_ok(
  $$update public.favorites
    set scryfall_id = 'cccccccc-cccc-cccc-cccc-cccccccccccc'$$,
  '42501',
  null,
  'anon cannot update favorites'
);
select throws_ok(
  $$delete from public.favorites$$,
  '42501',
  null,
  'anon cannot delete favorites'
);

set local role authenticated;
set local request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';
select results_eq(
  $$insert into public.favorites (scryfall_id)
    values ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb')
    returning scryfall_id::text$$,
  array['bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'],
  'owner can insert a favorite using the default user_id'
);
select results_eq(
  $$select scryfall_id::text
    from public.favorites
    order by scryfall_id$$,
  array['bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'],
  'owner sees only their own favorites'
);
select throws_ok(
  $$insert into public.favorites (user_id, scryfall_id)
    values (
      '22222222-2222-2222-2222-222222222222',
      'cccccccc-cccc-cccc-cccc-cccccccccccc'
    )$$,
  '42501',
  null,
  'owner cannot add a favorite for another user'
);

set local request.jwt.claim.sub = '22222222-2222-2222-2222-222222222222';
select results_eq(
  $$select scryfall_id::text from public.favorites$$,
  array['aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'],
  'another user sees only their own favorites'
);
select is_empty(
  $$delete from public.favorites
    where scryfall_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
    returning scryfall_id$$,
  'another user cannot delete the owner favorite'
);

set local request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';
select results_eq(
  $$select scryfall_id::text
    from public.favorites
    where scryfall_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'$$,
  array['bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'],
  'the denied delete leaves the owner favorite intact'
);

set local request.jwt.claim.sub = '22222222-2222-2222-2222-222222222222';
select results_eq(
  $$delete from public.favorites
    where scryfall_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
    returning scryfall_id::text$$,
  array['aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'],
  'owner can delete their own favorite'
);

set local request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';
select results_eq(
  $$delete from public.favorites
    where scryfall_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
    returning scryfall_id::text$$,
  array['bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'],
  'owner can delete their own favorite'
);

select * from finish();
rollback;
