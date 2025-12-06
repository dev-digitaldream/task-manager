#!/bin/sh
set -e

cd /app/server

# Initialize database if not exists
if [ ! -f /app/data/prod.db ]; then
    echo "🗄️  Creating new database..."
    npx prisma db push
    echo "🌱 Seeding demo data..."
    node src/seed-demo.js
else
    echo "✅ Database exists"
    # Check if database is empty (no users)
    USER_COUNT=$(echo "SELECT COUNT(*) FROM User;" | sqlite3 /app/data/prod.db 2>/dev/null || echo "0")
    if [ "$USER_COUNT" = "0" ]; then
        echo "🌱 Database empty, seeding demo data..."
        node src/seed-demo.js
    else
        echo "✅ Database has $USER_COUNT users"
    fi
fi

# Start the application
echo "🚀 Starting application..."
exec node src/server.js

