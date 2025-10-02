#!/bin/bash

# ================================================
# Secure Deployment Script for Todo Collaboratif
# ================================================
#
# This script automates the deployment process
# Run with: ./deploy.sh [environment]
# Example: ./deploy.sh production
#
# ================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Environment (default: production)
ENV="${1:-production}"

echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}Todo Collaboratif Deployment${NC}"
echo -e "${GREEN}Environment: ${ENV}${NC}"
echo -e "${GREEN}================================${NC}"

# Check if .env exists
if [ ! -f "server/.env" ]; then
    echo -e "${RED}Error: server/.env file not found!${NC}"
    echo -e "${YELLOW}Please create server/.env from server/.env.example${NC}"
    exit 1
fi

# Install dependencies
echo -e "\n${YELLOW}[1/7] Installing server dependencies...${NC}"
cd server
npm ci --production

echo -e "\n${YELLOW}[2/7] Installing client dependencies...${NC}"
cd ../client
npm ci

# Generate Prisma Client
echo -e "\n${YELLOW}[3/7] Generating Prisma Client...${NC}"
cd ../server
npx prisma generate

# Run database migrations
echo -e "\n${YELLOW}[4/7] Running database migrations...${NC}"
npx prisma migrate deploy

# Build frontend
echo -e "\n${YELLOW}[5/7] Building frontend...${NC}"
cd ../client
npm run build

# Copy built files
echo -e "\n${YELLOW}[6/7] Copying built files...${NC}"
if [ -d "../server/public" ]; then
    rm -rf ../server/public
fi
mkdir -p ../server/public
cp -r dist/* ../server/public/

# Start/Restart server with PM2
echo -e "\n${YELLOW}[7/7] Starting server with PM2...${NC}"
cd ../server

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo -e "${RED}PM2 is not installed. Installing globally...${NC}"
    npm install -g pm2
fi

# Start or restart the app
if pm2 list | grep -q "todo-server"; then
    echo -e "${GREEN}Restarting existing PM2 process...${NC}"
    pm2 restart todo-server
else
    echo -e "${GREEN}Starting new PM2 process...${NC}"
    pm2 start src/server.js --name todo-server --env ${ENV}
fi

# Save PM2 configuration
pm2 save

# Setup PM2 startup script (first time only)
if [ ! -f ~/.pm2/startup.sh ]; then
    echo -e "${YELLOW}Setting up PM2 startup script...${NC}"
    pm2 startup
fi

echo -e "\n${GREEN}================================${NC}"
echo -e "${GREEN}Deployment complete!${NC}"
echo -e "${GREEN}================================${NC}"
echo -e "${YELLOW}View logs:${NC} pm2 logs todo-server"
echo -e "${YELLOW}Monitor:${NC} pm2 monit"
echo -e "${YELLOW}Stop:${NC} pm2 stop todo-server"
echo -e "${YELLOW}Restart:${NC} pm2 restart todo-server"
