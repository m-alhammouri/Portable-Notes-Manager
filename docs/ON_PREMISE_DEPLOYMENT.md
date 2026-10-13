# On-premises installation

The supported installation target is a Linux server with Docker Engine and the Docker Compose plugin. On Windows Server, use a compatible Linux virtual machine/container host and follow these Linux steps inside it. No Replit account, service, or runtime is needed.

## 1. Clone the shared repository

```sh
git clone <github-repository-url> portable-notes-manager
cd portable-notes-manager
```

## 2. Configure environment variables

```sh
cp .env.example .env
```

Edit `.env` before starting anything:

- Replace the example `POSTGRES_PASSWORD` with a unique strong password.
- Use the same username, password, and database name in `DATABASE_URL`.
- Set `APP_PORT` to the port users should access.
- Set `APP_VERSION` to the release name or version.

Keep `.env` private and out of Git. The image does not contain database credentials. The backend reads its connection only from `DATABASE_URL`.

## 3. Start PostgreSQL and wait for its health check

```sh
docker compose up -d db
docker compose ps
```

PostgreSQL stores data in the named `postgres_data` volume. Do not run `docker compose down -v` unless you intentionally want to permanently delete that database volume.

## 4. Build the application image

```sh
docker compose build app
```

The image builds the React/Vite frontend and TypeScript/Express API from this repository, then the API serves the frontend as static files. It is one application service and one PostgreSQL service; the frontend uses REST endpoints and never connects to PostgreSQL.

## 5. Apply migrations, then start the application

```sh
docker compose run --rm app pnpm --filter @workspace/db run migrate
docker compose up -d app
```

The migration command only applies pending, version-controlled migrations. It does not reset or delete production records. Take a database backup before applying schema changes to an important production database.

## 6. Open the application and check health

Open `http://<server-address>:<APP_PORT>` in a browser. The API health endpoint is:

```sh
curl -i http://localhost:5000/api/health
```

The `/api/health` response is `200` when PostgreSQL is reachable and `503` when it is not. The response reports the configured app version.

## Use an existing PostgreSQL server

The application does not require a PostgreSQL container. Set `DATABASE_URL` in `.env` to the existing server's connection string, then start only the app:

```sh
docker compose build app
docker compose run --rm app pnpm --filter @workspace/db run migrate
docker compose up -d app
```

When starting only `app`, Compose does not start the `db` service. Ensure the app container can reach the host/database named in `DATABASE_URL`, including any required firewall and TLS settings.

## Stop and restart

```sh
docker compose stop
docker compose start
```

These commands keep the database volume. For routine maintenance, use `docker compose down` (without `-v`) and `docker compose up -d`; do not remove the named volume.
