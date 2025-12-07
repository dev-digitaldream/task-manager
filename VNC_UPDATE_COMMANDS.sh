#!/bin/bash

# 🚀 FlowSpaces VPS Update - Commands to run via VNC Terminal
# Copy-paste these commands directly in your VNC terminal session

echo "╔════════════════════════════════════════════════════════════╗"
echo "║     FlowSpaces VPS Update - Via VNC Terminal              ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# ════════════════════════════════════════════════════════════════
# PART 1: Check Current Status
# ════════════════════════════════════════════════════════════════

echo "1️⃣  CHECKING CURRENT STATUS"
echo "════════════════════════════════════════════════════════════"
echo ""

echo "Checking Docker containers:"
docker ps

echo ""
echo "Checking FlowSpaces app:"
docker logs -f flowspaces --tail 20

echo ""
echo "Checking app health:"
curl -s http://localhost:3001/health | jq . || echo "App not responding"

echo ""

# ════════════════════════════════════════════════════════════════
# PART 2: Update Application
# ════════════════════════════════════════════════════════════════

echo "2️⃣  STOPPING OLD VERSION"
echo "════════════════════════════════════════════════════════════"
echo ""

echo "Stopping containers..."
cd /opt/flowspaces
docker compose down

echo "✅ Old version stopped"
echo ""

# ════════════════════════════════════════════════════════════════
# PART 3: Get Latest Code
# ════════════════════════════════════════════════════════════════

echo "3️⃣  PULLING LATEST CODE"
echo "════════════════════════════════════════════════════════════"
echo ""

# If using git
if [ -d .git ]; then
    echo "Pulling from Git..."
    git pull origin main 2>/dev/null || echo "Git pull skipped (Dokploy manages)"
else
    echo "⚠️  Git not initialized. Code will be pulled via Dokploy."
fi

echo ""

# ════════════════════════════════════════════════════════════════
# PART 4: Rebuild and Deploy
# ════════════════════════════════════════════════════════════════

echo "4️⃣  REBUILDING DOCKER IMAGE"
echo "════════════════════════════════════════════════════════════"
echo ""

echo "Building new image (this will take 5-10 minutes)..."
docker build -t flowspaces:latest .

if [ $? -eq 0 ]; then
    echo "✅ Docker build successful"
else
    echo "❌ Docker build failed - check errors above"
    exit 1
fi

echo ""

# ════════════════════════════════════════════════════════════════
# PART 5: Start Services
# ════════════════════════════════════════════════════════════════

echo "5️⃣  STARTING SERVICES"
echo "════════════════════════════════════════════════════════════"
echo ""

echo "Starting containers..."
docker compose up -d

echo "Waiting for app to start..."
sleep 10

echo ""

# ════════════════════════════════════════════════════════════════
# PART 6: Verify
# ════════════════════════════════════════════════════════════════

echo "6️⃣  VERIFICATION"
echo "════════════════════════════════════════════════════════════"
echo ""

echo "Checking containers:"
docker ps

echo ""
echo "Testing health endpoint:"
curl -s http://localhost:3001/health | jq . || echo "Waiting for app to be ready..."

echo ""
echo "Checking Uptime Kuma:"
curl -s http://localhost:3002 > /dev/null && echo "✅ Uptime Kuma running" || echo "⚠️  Kuma not responding yet"

echo ""

# ════════════════════════════════════════════════════════════════
# PART 7: Logs
# ════════════════════════════════════════════════════════════════

echo "7️⃣  CHECKING LOGS (Press Ctrl+C to exit)"
echo "════════════════════════════════════════════════════════════"
echo ""

docker logs -f flowspaces
