#!/bin/bash

echo "🔍 CapRover Configuration Verification"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo "✅ Local files:"
echo ""

# Check captain-definition
if [ -f "captain-definition" ]; then
    echo -e "${GREEN}✓${NC} captain-definition exists"
    DOCKERFILE=$(cat captain-definition | grep dockerfilePath | cut -d'"' -f4)
    echo "  → Points to: $DOCKERFILE"

    if [ -f "$DOCKERFILE" ]; then
        echo -e "${GREEN}✓${NC} $DOCKERFILE exists"

        # Check if it exposes port 3001
        if grep -q "EXPOSE 3001" "$DOCKERFILE"; then
            echo -e "${GREEN}✓${NC} Exposes port 3001"
        else
            echo -e "${RED}✗${NC} Missing EXPOSE 3001"
        fi

        # Check if it has start script
        if grep -q "start.sh" "$DOCKERFILE"; then
            echo -e "${GREEN}✓${NC} Uses start.sh for initialization"
        else
            echo -e "${YELLOW}⚠${NC}  No start.sh script"
        fi
    else
        echo -e "${RED}✗${NC} $DOCKERFILE not found!"
    fi
else
    echo -e "${RED}✗${NC} captain-definition not found!"
fi

echo ""
echo "📋 Required CapRover Configuration:"
echo ""
echo "1. Container HTTP Port: 3001"
echo "2. Persistent Directory: /app/data"
echo "3. Environment Variables:"
echo "   - NODE_ENV=production"
echo "   - PORT=3001"
echo "   - CLIENT_URL=https://todo.digitaldream.work"
echo "   - DATABASE_URL=file:/app/data/todo.db"
echo ""
echo "4. HTTP Settings:"
echo "   ✓ Enable HTTPS"
echo "   ✓ Force HTTPS"
echo "   ✓ Websocket Support"
echo ""
echo "🌐 To redeploy:"
echo "1. Go to https://captain.digitaldream.work"
echo "2. Apps → todo-digitaldream → Deployment"
echo "3. Click 'Force Build'"
echo ""
