#!/bin/bash

# ================================================
# Prepare for Git - Clean Database & Setup
# ================================================
#
# This script prepares the project for Git by:
# 1. Cleaning the database (removes test data)
# 2. Creating .env.example (if missing)
# 3. Checking .gitignore
#
# Copyright (c) 2025 Digital Dream (www.digitaldream.work)
# Licensed under MIT
#
# ================================================

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}Preparing for Git${NC}"
echo -e "${GREEN}================================${NC}"

# 1. Clean database
echo -e "\n${YELLOW}[1/4] Cleaning database...${NC}"
cd server
node src/seed-empty.js
cd ..

# 2. Check .env.example
echo -e "\n${YELLOW}[2/4] Checking .env.example...${NC}"
if [ ! -f "server/.env.example" ]; then
    echo -e "${RED}Error: server/.env.example not found!${NC}"
    exit 1
fi
echo -e "${GREEN}✓ .env.example exists${NC}"

# 3. Check .gitignore
echo -e "\n${YELLOW}[3/4] Checking .gitignore...${NC}"
if [ ! -f ".gitignore" ]; then
    echo -e "${RED}Error: .gitignore not found!${NC}"
    exit 1
fi
echo -e "${GREEN}✓ .gitignore exists${NC}"

# 4. Remove sensitive files
echo -e "\n${YELLOW}[4/4] Checking for sensitive files...${NC}"

if [ -f "server/.env" ]; then
    echo -e "${YELLOW}⚠️  server/.env exists (will be ignored by Git)${NC}"
fi

if [ -f "server/prisma/dev.db" ]; then
    echo -e "${GREEN}✓ dev.db will be ignored by Git${NC}"
fi

echo -e "\n${GREEN}================================${NC}"
echo -e "${GREEN}Ready for Git!${NC}"
echo -e "${GREEN}================================${NC}"
echo -e "\nNext steps:"
echo -e "  ${YELLOW}git init${NC}"
echo -e "  ${YELLOW}git add .${NC}"
echo -e "  ${YELLOW}git commit -m 'Initial commit - Open Source Task Manager'${NC}"
echo -e "  ${YELLOW}git remote add origin https://github.com/YOUR_USERNAME/task-manager.git${NC}"
echo -e "  ${YELLOW}git push -u origin main${NC}"
echo -e "\n${GREEN}Done! 🎉${NC}"
