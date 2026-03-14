# Supabase CLI Setup (VIC)

This project uses Supabase for PostgreSQL only (Hi.Events app database).

## Important

- Hi.Events manages its own schema migrations on Railway.
- CORS for browser access in this architecture is handled by Hi.Events backend env vars, not Supabase, unless you directly call Supabase APIs from frontend code.

## CLI Commands

1. Install Supabase CLI (choose one)

- scoop install supabase
- OR choco install supabase

2. Login

- supabase login

3. Link project

- supabase link --project-ref xeeweupdezxcyqkomswd

4. Verify project

- supabase projects list
- supabase db ping --linked

5. Optional migration workflow for custom SQL outside Hi.Events

- supabase migration new custom_tables
- supabase db push --linked

## Connection Note

If your password has `#`, URL encode as `%23` in URI-style connection strings.
Example:

postgresql://postgres:postgresAlphaCoder%232424@db.xeeweupdezxcyqkomswd.supabase.co:5432/postgres
