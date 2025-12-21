#!/bin/bash

# 🔥 Emergency CPU Cleanup Script
# Usage: chmod +x cleanup.sh && ./cleanup.sh

set -e

echo "=========================================="
echo "🔥 Emergency CPU Cleanup"
echo "=========================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Step 1: Stop all PM2 processes
echo -e "${YELLOW}🛑 Step 1: Stopping all PM2 processes...${NC}"
pm2 delete all 2>/dev/null || echo "No PM2 processes"
pm2 kill 2>/dev/null || echo "PM2 already stopped"

# Step 2: Kill the high CPU javae process (PID 619)
echo -e "${YELLOW}🔪 Step 2: Killing high CPU processes...${NC}"
if ps -p 619 > /dev/null 2>&1; then
    echo -e "${RED}Killing javae process (PID 619)...${NC}"
    kill -9 619 2>/dev/null || echo "Process already killed"
else
    echo "PID 619 not found"
fi

# Step 3: Kill all Java processes
echo -e "${YELLOW}☕ Step 3: Cleaning up Java processes...${NC}"
pkill -9 java 2>/dev/null || echo "No Java processes found"

# Step 4: Kill all Node processes
echo -e "${YELLOW}📦 Step 4: Cleaning up Node processes...${NC}"
pkill -9 node 2>/dev/null || echo "No Node processes found"

# Step 5: Kill all Next.js processes
echo -e "${YELLOW}⚡ Step 5: Cleaning up Next.js processes...${NC}"
pkill -9 next-server 2>/dev/null || echo "No Next.js processes found"

# Step 6: Wait a moment
echo -e "${YELLOW}⏳ Step 6: Waiting 5 seconds...${NC}"
sleep 5

# Step 7: Check current CPU usage
echo -e "${GREEN}📊 Step 7: Current CPU usage:${NC}"
echo "=========================================="
top -b -n 1 | head -10

# Step 8: Show top CPU processes
echo ""
echo -e "${GREEN}🔍 Top CPU consuming processes:${NC}"
echo "=========================================="
ps aux --sort=-%cpu | head -10

# Step 9: Check if javae is still running
echo ""
if ps aux | grep -v grep | grep javae > /dev/null; then
    echo -e "${RED}⚠️  WARNING: javae process is still running!${NC}"
    ps aux | grep javae
    echo ""
    echo "Try manually: kill -9 \$(pgrep javae)"
else
    echo -e "${GREEN}✅ javae process killed successfully!${NC}"
fi

echo ""
echo "=========================================="
echo -e "${GREEN}✅ Cleanup complete!${NC}"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Check CPU: top"
echo "2. Start your app: pm2 start npm --name 'dialexportmart' -- start"
echo "3. Monitor: pm2 monit"






