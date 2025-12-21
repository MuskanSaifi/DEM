#!/bin/bash

# 🚨 COMPLETE XMRIG REMOVAL SCRIPT
# Run: chmod +x remove-xmrig-complete.sh && ./remove-xmrig-complete.sh

echo "=========================================="
echo "🚨 COMPLETE XMRIG REMOVAL"
echo "=========================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Step 1: Stop and disable systemd service
echo -e "${YELLOW}🛑 Step 1: Stopping and disabling xmrig service...${NC}"
systemctl stop xmrig.service 2>/dev/null && echo -e "${GREEN}✅ Service stopped${NC}" || echo -e "${YELLOW}⚠️  Service not running or doesn't exist${NC}"
systemctl disable xmrig.service 2>/dev/null && echo -e "${GREEN}✅ Service disabled${NC}" || echo -e "${YELLOW}⚠️  Service not found${NC}"

# Step 2: Kill all xmrig processes
echo -e "${RED}🔪 Step 2: Killing all xmrig processes...${NC}"
pkill -9 xmrig 2>/dev/null && echo -e "${GREEN}✅ All xmrig processes killed${NC}" || echo -e "${YELLOW}⚠️  No xmrig processes found${NC}"

# Step 3: Remove systemd service files
echo -e "${YELLOW}🗑️  Step 3: Removing systemd service files...${NC}"
rm -f /etc/systemd/system/xmrig.service && echo -e "${GREEN}✅ Service file removed${NC}" || echo -e "${YELLOW}⚠️  Service file not found${NC}"
rm -f /etc/systemd/system/multi-user.target.wants/xmrig.service && echo -e "${GREEN}✅ Service symlink removed${NC}" || echo -e "${YELLOW}⚠️  Symlink not found${NC}"

# Step 4: Reload systemd
echo -e "${YELLOW}🔄 Step 4: Reloading systemd...${NC}"
systemctl daemon-reload && echo -e "${GREEN}✅ Systemd reloaded${NC}"

# Step 5: Delete xmrig files
echo -e "${YELLOW}🗑️  Step 5: Deleting xmrig files...${NC}"
if [ -d "/media/xmrig-6.24.0" ]; then
    rm -rf /media/xmrig-6.24.0 && echo -e "${GREEN}✅ xmrig directory deleted${NC}" || echo -e "${RED}❌ Failed to delete directory${NC}"
else
    echo -e "${YELLOW}⚠️  xmrig directory not found${NC}"
fi

# Step 6: Verify removal
echo ""
echo -e "${GREEN}🔍 Step 6: Verifying removal...${NC}"
echo "=========================================="

# Check if process is running
if ps aux | grep -v grep | grep xmrig > /dev/null; then
    echo -e "${RED}❌ xmrig process is still running!${NC}"
    ps aux | grep xmrig | grep -v grep
else
    echo -e "${GREEN}✅ No xmrig processes running${NC}"
fi

# Check if service exists
if systemctl list-unit-files | grep -q xmrig; then
    echo -e "${RED}❌ xmrig service still exists!${NC}"
    systemctl list-unit-files | grep xmrig
else
    echo -e "${GREEN}✅ xmrig service removed${NC}"
fi

# Check if files exist
REMAINING=$(find / -name "*xmrig*" 2>/dev/null | grep -v "/proc/" | grep -v "/sys/")
if [ -z "$REMAINING" ]; then
    echo -e "${GREEN}✅ No xmrig files found${NC}"
else
    echo -e "${YELLOW}⚠️  Some xmrig files still exist:${NC}"
    echo "$REMAINING"
fi

# Step 7: Check CPU usage
echo ""
echo -e "${GREEN}📊 Current CPU usage:${NC}"
echo "=========================================="
top -b -n 1 | head -10

# Step 8: Show top processes
echo ""
echo -e "${GREEN}🔍 Top CPU consuming processes:${NC}"
echo "=========================================="
ps aux --sort=-%cpu | head -10

echo ""
echo "=========================================="
echo -e "${GREEN}✅ XMRIG REMOVAL COMPLETE!${NC}"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Check security: tail -100 /var/log/auth.log"
echo "2. Change passwords: passwd root"
echo "3. Update system: apt update && apt upgrade -y"
echo "4. Install fail2ban: apt install fail2ban -y"
echo "5. Start your app: pm2 start npm --name 'dialexportmart' -- start"

