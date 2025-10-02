#!/bin/sh
set -e

echo "Starting application setup..."

# Ensure data directory exists
mkdir -p /app/data

# Set database URL for production
export DATABASE_URL="file:/app/data/prod.db"

echo "Generating Prisma client..."
npx prisma generate || {
    echo "Prisma generate failed, retrying..."
    sleep 2
    npx prisma generate
}

echo "Setting up database..."
npx prisma db push --accept-data-loss || {
    echo "Database push failed, continuing..."
}

echo "Seeding database..."
npm run db:seed || {
    echo "Seeding failed, but continuing..."
}

echo "Starting server..."
exec node src/server.js