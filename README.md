# Portable Notes Manager

A small, responsive student-notes application backed by a standard PostgreSQL database. The same source tree runs in Replit for development and in a Linux-container environment on premises; only environment configuration changes between deployments.

## Requirements

- Node.js 24 and pnpm for development
- PostgreSQL, supplied by `compose.yaml` or an existing PostgreSQL server
- Docker with the Compose plugin for the container deployment

## Features

- List, search, add, edit, and delete student notes
- Search by student name or note title
- REST API with `/api/health` database connectivity check and `/api/healthz` liveness check
- PostgreSQL schema and version-controlled Drizzle migrations
- Production frontend served by the Express API from one application container

Each note has an auto-generated ID, student name, title, description, creation time, and update time.

## Run in Replit

Set `DATABASE_URL` to the development PostgreSQL connection string, then apply migrations:

```sh
pnpm install --frozen-lockfile
pnpm --filter @workspace/db run migrate
```

The configured API and web workflows run the Express API and Vite development server. Open the web preview to use the application. The API is also available under `/api`.

For standalone development outside Replit, set `DATABASE_URL` in the shell and run the API and web commands in separate terminals:

```sh
PORT=5000 pnpm --filter @workspace/api-server run dev
```

```sh
VITE_API_BASE_URL=http://127.0.0.1:5000 PORT=5173 BASE_PATH=/ pnpm --filter @workspace/portable-notes-manager run dev
```

`VITE_API_BASE_URL` is only needed when the development web server and API use different origins. Leave it unset in Replit and in the single-container production deployment; both route `/api` on the same origin.

## On-premises Docker deployment

Follow [docs/ON_PREMISE_DEPLOYMENT.md](docs/ON_PREMISE_DEPLOYMENT.md) for first install. Use [docs/UPDATE_DEPLOYMENT.md](docs/UPDATE_DEPLOYMENT.md) for safe updates that retain database records.

Quick start on a Linux server:

```sh
cp .env.example .env
# Edit .env and replace POSTGRES_PASSWORD with a unique strong value.
docker compose up -d db
docker compose build app
docker compose run --rm app pnpm --filter @workspace/db run migrate
docker compose up -d app
```

Open `http://<server-address>:5000`. The PostgreSQL data is stored in the named `postgres_data` volume and is not part of the application image.

## API

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | Checks the API and PostgreSQL connectivity |
| `GET` | `/api/healthz` | Liveness check |
| `GET` | `/api/notes?search=...` | List notes; optional student-name/title search |
| `POST` | `/api/notes` | Create a note |
| `GET` | `/api/notes/:id` | Get a note |
| `PATCH` | `/api/notes/:id` | Update a note |
| `DELETE` | `/api/notes/:id` | Delete a note |

The OpenAPI contract is at `lib/api-spec/openapi.yaml`. Generated client and server validation schemas live in `lib/api-client-react` and `lib/api-zod`.

## Development checks

```sh
pnpm --filter @workspace/api-spec run codegen
pnpm --filter @workspace/db run generate
pnpm --filter @workspace/db run migrate
pnpm run typecheck
```

The migration command applies pending migrations; it does not reset the database. Do not use destructive schema synchronization against production.

## Source and release version

Keep the GitHub repository as the shared source of application code and migrations. Replit development and on-premises production each use their own `DATABASE_URL`; database rows are never synchronized by Git or deployment. Set `APP_VERSION` in each environment to identify its running release. The full GitHub setup and update workflow is in `docs/UPDATE_DEPLOYMENT.md`.

## Portability verification

The Replit UI/API CRUD flow and PostgreSQL health check are verified during development. Docker is not available for execution in this Replit environment, so image build, Compose health checks, persistent-volume behavior, and the external-PostgreSQL Compose mode still need to be verified on a Docker host. See [docs/ON_PREMISE_DEPLOYMENT.md](docs/ON_PREMISE_DEPLOYMENT.md).
