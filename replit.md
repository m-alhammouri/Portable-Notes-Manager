# Portable Notes Manager

A portable student notes app with a React/Vite interface, Express REST API, Drizzle ORM, and PostgreSQL.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server
- `pnpm --filter @workspace/portable-notes-manager run dev` — run the Vite web app
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run generate` — generate a version-controlled migration from schema changes
- `pnpm --filter @workspace/db run migrate` — apply pending migrations
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/portable-notes-manager/` — React/Vite client
- `artifacts/api-server/` — Express REST API and production static frontend serving
- `lib/api-spec/openapi.yaml` — API contract
- `lib/db/src/schema/` and `lib/db/migrations/` — PostgreSQL schema and migration history
- `Dockerfile`, `compose.yaml`, `.env.example` — portable Docker deployment configuration
- `docs/` — setup and deployment guides

## Architecture decisions

- The application reads its database connection only from `DATABASE_URL`; each environment uses an independent PostgreSQL database.
- Production Docker serves the built frontend and API from one Express service.
- Schema updates use checked-in Drizzle migrations; deployments never reset data or run automatic schema push.
- Replit-specific services are not application dependencies.

## Product

Manage student notes: list, search by student name or title, create, edit, and delete.

## User preferences

Portability across Replit and on-premises is the highest priority. Keep the project small and do not add unnecessary features.

## Gotchas

- Replit workflows inject `PORT` and `BASE_PATH`; standalone Docker builds set them explicitly.
- Apply migrations with `migrate`, not destructive schema synchronization.
- Keep `.env` out of Git; do not use `docker compose down -v` unless intentionally deleting the database volume.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
