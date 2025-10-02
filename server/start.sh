#!/bin/sh
set -e

DATA_DIR="/app/data"
DB_FILE=$(echo "${DATABASE_URL:-file:/app/data/prod.db}" | sed 's|^file:||')

echo "Ensuring data directory exists at $DATA_DIR ..."
mkdir -p "$DATA_DIR"

if [ "${RESET_DB:-false}" = "true" ]; then
  echo "RESET_DB=true → removing database file: $DB_FILE"
  rm -f "$DB_FILE"
fi

echo "Initializing database..."
npx prisma generate
npx prisma db push

# Seed only if explicitly enabled (avoid wiping prod data)
if [ "${SEED:-false}" = "true" ]; then
  echo "Seeding enabled (SEED=true), running seed script..."
  npm run db:seed
else
  echo "Seeding skipped (SEED not true)."
fi

echo "Starting application..."
exec node src/server.js