#!/bin/sh
set -e

# Initialize database if not exists
if [ ! -f /app/data/dev.db ]; then
    echo "Initializing database..."
    cd /app/server
    npx prisma db push
    node src/seed-demo.js
fi

# Start the application
echo "Starting application..."
cd /app/server
exec node src/server.js
