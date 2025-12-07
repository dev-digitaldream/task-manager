#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Kill ports
lsof -ti:3001,5173 | xargs kill -9 2>/dev/null
sleep 1

echo "🚀 Starting Original FlowSpaces (React)..."

# Start Backend
echo "📦 Starting Server on :3001..."
cd "$SCRIPT_DIR/server"
npm start > "$SCRIPT_DIR/server.log" 2>&1 &
SERVER_PID=$!

# Wait for server
sleep 3

# Start Client
echo "✨ Starting Client on :5173..."
cd "$SCRIPT_DIR/client"
npm run dev

# Cleanup
trap "kill $SERVER_PID" EXIT
