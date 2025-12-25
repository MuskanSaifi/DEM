#!/bin/bash

# 🚨 URGENT: Kill xmrig Process Script
# Run: chmod +x kill-xmrig.sh && ./kill-xmrig.sh

echo "=========================================="
echo "🚨 KILLING XMRIG PROCESS"
echo "=========================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Step 1: Kill xmrig process (PID 1187)
echo -e "${RED}🔪 Step 1: Killing xmrig process (PID 1187)...${NC}"
if ps -p 1187 > /dev/null 2>&1; then
    kill -9 1187 2>/dev/null && echo -e "${GREEN}✅ PID 1187 killed${NC}" || echo -e "${YELLOW}⚠️  Process already dead${NC}"
else
    echo -e "${YELLOW}⚠️  PID 1187 not found${NC}"
fi

# Step 2: Kill ALL xmrig processes
echo -e "${RED}🔪 Step 2: Killing ALL xmrig processes...${NC}"
pkill -9 xmrig 2>/dev/null && echo -e "${GREEN}✅ All xmrig processes killed${NC}" || echo -e "${YELLOW}⚠️  No xmrig processes found${NC}"

# Step 3: Verify xmrig is gone
echo -e "${YELLOW}🔍 Step 3: Verifying xmrig is killed...${NC}"
sleep 2
if ps aux | grep -v grep | grep xmrig > /dev/null; then
    echo -e "${RED}❌ xmrig is still running!${NC}"
    ps aux | grep xmrig | grep -v grep
    echo ""
    echo "Try manually: pkill -9 xmrig"
else
    echo -e "${GREEN}✅ xmrig successfully killed!${NC}"
fi

# Step 4: Check current CPU usage
echo ""
echo -e "${GREEN}📊 Current CPU usage:${NC}"
echo "=========================================="
top -b -n 1 | head -10

# Step 5: Show top CPU processes
echo ""
echo -e "${GREEN}🔍 Top CPU consuming processes:${NC}"
echo "=========================================="
ps aux --sort=-%cpu | head -10

# Step 6: Check for other miners
echo ""
echo -e "${YELLOW}🔍 Checking for other mining processes...${NC}"
MINERS=$(ps aux | grep -E "xmrig|minerd|cpuminer|stratum" | grep -v grep)
if [ -z "$MINERS" ]; then
    echo -e "${GREEN}✅ No other miners found${NC}"
else
    echo -e "${RED}⚠️  Found other miners:${NC}"
    echo "$MINERS"
fi

echo ""
echo "=========================================="
echo -e "${GREEN}✅ Cleanup complete!${NC}"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Check CPU: top"
echo "2. Find xmrig source: find / -name '*xmrig*' 2>/dev/null"
echo "3. Check cron: crontab -l"
echo "4. Start your app: pm2 start npm --name 'dialexportmart' -- start"


