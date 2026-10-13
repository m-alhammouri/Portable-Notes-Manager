# Replit development setup

The application uses the same ordinary Node.js, Express, React, and PostgreSQL code in Replit and on premises. Replit is not used by the application for database access, authentication, or storage.

## Configure PostgreSQL

Set the Replit environment variable `DATABASE_URL` to the connection string for the development PostgreSQL database. The app reads no other database connection setting. Keep this value out of Git and do not copy it to the production server.

Apply the version-controlled migration:

```sh
pnpm install --frozen-lockfile
pnpm --filter @workspace/db run migrate
```

The migration creates the notes table if it has not been created. It does not delete existing records or reset the database.

## Start and use the app

The Replit project has two configured workflows:

- API server: Express API at `/api`
- Web app: Vite development preview at `/`

Start/restart those workflows from the Replit workspace and open the web preview. CRUD requests go through the REST API; the browser does not connect directly to PostgreSQL.

Check the server and its database connection:

```sh
curl -i "https://${REPLIT_DEV_DOMAIN}/api/health"
```

An available API and database return HTTP `200` with `status: "ok"` and `database: true`. An unavailable database returns HTTP `503`.

## Keep environments separate

Use the development database only in Replit. Configure a different production PostgreSQL database using the on-premises `.env` file. GitHub shares application code and migration files only; there is no automatic row synchronization between environments.
