# Supabase migrations

This repository uses imperative SQL migrations in `supabase/migrations/`. The
Supabase CLI is pinned as a development dependency, so use `npx supabase` from
the repository root to run the version in `package-lock.json`.

## One-time setup

Install the project's dependencies and verify the CLI version:

```sh
npm ci
npx supabase --version
```

The version should be `2.122.0`. Authenticate the CLI, then link this checkout
to the Supabase project. Use the project reference from the Supabase dashboard;
it is not a secret.

```sh
npx supabase login
npx supabase link --project-ref <PROJECT_REF>
```

The link command may prompt for the database password. Do not put database
passwords, access tokens, or service-role keys in source files or commit them.
For automated CLI use, set `SUPABASE_ACCESS_TOKEN` to a scoped access token in
the environment or CI secret store.

## Create and test a migration

Create each migration with the CLI so it receives the expected timestamped
filename. Add the SQL to the generated file, then review it before applying.

```sh
npx supabase migration new <descriptive_name>
```

The local Supabase stack and pgTAP tests are optional and require Docker. The
RLS test suite runs against a local database; do not run fixture tests against
the production project.

```sh
npx supabase start
npx supabase db reset --local
npx supabase test db --local
npx supabase stop
```

`db reset --local` recreates the local database and applies all migrations.
Use it only when discarding local database state is acceptable. The application
does not require Docker for the remote migration workflow.

## Apply to the linked project

First inspect the pending changes with a dry run. Apply only after confirming
that the listed migrations are expected:

```sh
npx supabase db push --linked --dry-run --skip-vault
npx supabase db push --linked --skip-vault
```

Check the migration history afterward:

```sh
npx supabase migration list --linked
```

These commands operate on the project linked by `supabase link`. Never skip the
dry run for a remote push. Schema changes should be committed as migrations;
use the dashboard to inspect data, not to make untracked production schema
changes.
