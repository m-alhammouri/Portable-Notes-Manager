# Architecture

## Runtime

```text
Browser
  └── React + Vite app
        └── REST calls to /api/*
              └── Express + TypeScript API
                    └── Drizzle ORM
                          └── PostgreSQL via DATABASE_URL
```

In Replit development, the web preview and shared Express API run as separate development workflows. In a production container, Docker builds the React/Vite output and the API, copies the frontend build into the API image, and Express serves both `/api/*` and the frontend from one application service.

## Source-of-truth locations

- `artifacts/portable-notes-manager/` — React/Vite interface
- `artifacts/api-server/` — Express REST API and production static-file serving
- `lib/api-spec/openapi.yaml` — REST contract
- `lib/api-client-react/` — generated React Query client
- `lib/api-zod/` — generated request/response validators
- `lib/db/src/schema/` — Drizzle PostgreSQL schema
- `lib/db/migrations/` — version-controlled SQL migrations
- `Dockerfile`, `compose.yaml`, `.env.example` — portable container setup
- `docs/` — environment setup, architecture, and deployment procedures

## Data flow and API

The browser calls the REST API at `/api`. It never imports database code or opens a PostgreSQL connection. The Express server validates request and response data with generated Zod schemas and uses Drizzle to read and write the notes table.

The API supports note list/search, create, read, update, and delete operations. Search matches student names and note titles. `GET /api/health` checks `DATABASE_URL` connectivity; `GET /api/healthz` is a lightweight liveness endpoint.

## Configuration and environment isolation

`DATABASE_URL` is the only database connection setting consumed by the application. Replit development and on-premises production must each configure their own PostgreSQL URL. `.env` is excluded from Git and Docker build context. Compose creates a persistent named PostgreSQL volume for local/on-premises deployments.

GitHub carries source code and migrations only. There is no application feature or deployment command that synchronizes rows between environments.

## Migrations and safe updates

Generate a migration after a schema change:

```sh
pnpm --filter @workspace/db run generate
```

Apply pending migrations in the target environment:

```sh
pnpm --filter @workspace/db run migrate
```

There is no automatic schema reset or destructive synchronization during app startup or deployment. Drizzle migrations are forward-only by default; database rollback and data recovery require an explicit, backed-up recovery plan.

## Portability boundaries

The API uses standard Node.js, Express, Drizzle, the PostgreSQL driver, and `DATABASE_URL`. The Vite configuration uses standard React/Vite/Tailwind plugins. Replit-specific database, auth, storage, and runtime services are not imported by the app. Docker Compose is optional during Replit development and is used for independent Linux-container deployments.
