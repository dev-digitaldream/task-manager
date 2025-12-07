#!/bin/bash

# Kill any existing node/bun processes on ports 3001 and 5173
echo "Stopping existing servers..."
lsof -ti:3001,5173 | xargs kill -9 2>/dev/null

# Start Backend
echo "Starting Backend..."
cd server
npm start &
BACKEND_PID=$!

# Wait for backend
sleep 2

# Start Frontend (Vue)
echo "Starting Frontend (Vue)..."
cd ../client-vue
/Users/mohammed/.bun/bin/bun run dev --port 5173

# Cleanup on exit
trap "kill $BACKEND_PID" EXIT
