# Local PostgreSQL

This database is for local development only. The Expo app does not connect directly to PostgreSQL; a future GraphQL backend will use this database.

## Start

From the project root:

```bash
docker compose up -d postgres
```

The first startup creates the `gym_logger` database and applies the SQL files in `backend/database/migrations`.

## Check status

```bash
docker compose ps
docker compose logs postgres
```

## Connect with psql

```bash
docker compose exec postgres psql -U gym_logger -d gym_logger
```

## Stop

```bash
docker compose down
```

To remove the local database volume and recreate the schema from scratch:

```bash
docker compose down -v
docker compose up -d postgres
```

Migration files are mounted as initialization scripts for a fresh volume. They are not re-run automatically when the volume already contains data.
