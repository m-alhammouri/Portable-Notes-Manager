# GitHub source and deployment updates

Replit development and on-premises production use one GitHub repository and the same app source. Configure `DATABASE_URL` separately in each environment. Git contains application code and migrations, never database rows or `.env` credentials.

## Create the shared GitHub repository

Create an empty repository in GitHub, then from the project root:

```sh
git init
git add .
git commit -m "Build Portable Notes Manager"
git branch -M main
git remote add origin <github-repository-url>
git push -u origin main
```

For later development, commit and push changes from the project:

```sh
git add .
git commit -m "Describe the update"
git push origin main
```

## Apply an on-premises update

From the existing clone on the server:

```sh
git pull --ff-only origin main
docker compose build app
docker compose run --rm app pnpm --filter @workspace/db run migrate
docker compose up -d app
docker compose ps
```

The database stays in the named Docker volume or in the independently managed external PostgreSQL server. Building/replacing the app image does not recreate the database. Apply the migration command deliberately before switching the app to a version that expects the new schema.

To see the health/version response:

```sh
curl -i http://localhost:5000/api/health
```

Set `APP_VERSION` in `.env` for each release. A deployment may also record the Git commit outside the app for audit purposes.

## Keep the environments independent

- Set Replit's `DATABASE_URL` to a development database.
- Set the on-premises `.env` `DATABASE_URL` to production PostgreSQL.
- Never copy one environment's connection string into the other.
- GitHub transfers code and migration files only; it never synchronizes records.

## Roll back application code

Before an update, record the deployed Git commit and keep a database backup. To restore application code to a known commit:

```sh
git log --oneline -n 10
git checkout <known-good-commit>
docker compose build app
docker compose up -d app
```

For a long-lived production checkout, use a release branch or tag instead of leaving the working tree detached. To return to the latest shared branch later:

```sh
git switch main
git pull --ff-only origin main
```

## Database migration rollback limitations

Drizzle's generated migrations are forward migrations; this repository does not automatically reverse schema changes or restore deleted data. Prefer additive, backward-compatible migrations. If a migration must be reversed, stop and assess the exact SQL/data impact, take a backup, and use a reviewed manual recovery plan. Reverting application code alone does not reverse a database migration. Never solve a schema mismatch by resetting or dropping the production database.
