# Supabase migrations

Run these commands from the repository root. The CLI commands below use
`npx supabase@latest` so they do not add a package dependency to this project.
The CLI syntax was checked with Supabase CLI 2.122.0 on 2026-10-27; check
`npx supabase@latest <command> --help` if the CLI reports changed options.

## One-time connection and project link

The local Supabase project is already initialized in this repository. Do not
run `supabase init` again.

1. Authenticate the CLI:

   ```sh
   npx supabase@latest login
   ```

   Follow the browser prompt. Treat the CLI access token as a secret; do not
   paste it into chat, commit it, or put it in a command that will be saved in
   shell history.

2. Link this checkout to the hosted project:

   ```sh
   npx supabase@latest link --project-ref <project-ref>
   ```

   The project ref is the ID in the Supabase Dashboard project URL. The CLI may
   prompt for the database password. Enter it in the prompt; do not commit or
   share it.

3. Check which project the local migration history is linked to:

   ```sh
   npx supabase@latest migration list --linked
   ```

The link is local CLI state, not an application environment variable. The
project URL and publishable key used by the app are configured separately in
the ignored `.env.local` file.

## Creating a migration

Create migration files with the CLI so their timestamped names follow the
project convention:

```sh
npx supabase@latest migration new <short_description>
```

Edit the generated SQL file under `supabase/migrations/`, review it, and test
it locally before applying it to the hosted project.

## Testing migrations locally

Local database testing requires a running Docker-compatible container runtime.
Start the runtime, then run:

```sh
npx supabase@latest start
npx supabase@latest db reset
npx supabase@latest test db
```

`db reset` recreates the **local** database, reapplies all migration files and
configured seed data, and deletes existing local database data. It does not
reset the hosted project. The pgTAP tests in `supabase/tests/` run against the
local database; `test db` does not test the hosted database.

When finished, stop the local stack:

```sh
npx supabase@latest stop
```

If `start` or `test db` cannot connect to the local database, confirm the
container runtime is running and that the CLI has finished starting its
services. Do not use the remote database password to work around a local
database startup problem.

## Previewing and applying to the hosted project

First preview the pending migrations. Always pass `--linked` so the target is
explicit; otherwise newer CLI versions may default to the local database.

```sh
npx supabase@latest db push --dry-run --linked
```

Review the output and confirm it targets the intended linked project and only
lists the migrations you expect. If correct, apply them:

```sh
npx supabase@latest db push --linked
```

Then confirm local and remote migration histories match:

```sh
npx supabase@latest migration list --linked
```

`db push` changes the hosted database. Do not run it until you have reviewed
the dry-run output. Do not apply schema changes directly to the hosted project
through the Dashboard SQL Editor or Table Editor; those changes bypass the
tracked migration history.

## Current migration and test

- Migration: `migrations/20261027145744_favorites.sql`
- pgTAP test: `tests/favorites_rls_test.sql`

For project decisions and the rationale behind this workflow, see
[`../DECISIONS.md` (D-014)](../DECISIONS.md).
