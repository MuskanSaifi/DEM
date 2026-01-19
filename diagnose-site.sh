#!/bin/bash

# 🔍 Site Diagnostic Script
# Run: chmod +x diagnose-site.sh && ./diagnose-site.sh

echo "=========================================="
echo "🔍 Dial Export Mart - Site Diagnostic"
echo "=========================================="
echo ""

cd /var/www/dialexportmart || {
    echo "❌ Directory /var/www/dialexportmart not found!"
    exit 1
}

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 1. Check Build
echo -e "${YELLOW}1. Checking Build...${NC}"
if [ -d ".next" ]; then
    echo -e "${GREEN}✅ Build directory exists${NC}"
    if [ -d ".next/standalone" ]; then
        echo -e "${GREEN}✅ Standalone build found${NC}"
    else
        echo -e "${YELLOW}⚠️  Standalone build not found (may be normal)${NC}"
    fi
else
    echo -e "${RED}❌ Build directory missing! Run: npm run build${NC}"
fi
echo ""

# 2. Check .env
echo -e "${YELLOW}2. Checking Environment Variables...${NC}"
if [ -f ".env" ]; then
    echo -e "${GREEN}✅ .env file exists${NC}"
    if grep -q "MONGODB_URI" .env; then
        echo -e "${GREEN}✅ MONGODB_URI found${NC}"
    else
        echo -e "${RED}❌ MONGODB_URI missing in .env${NC}"
    fi
else
    echo -e "${RED}❌ .env file missing!${NC}"
fi
echo ""

# 3. Check PM2 Status
echo -e "${YELLOW}3. Checking PM2 Status...${NC}"
pm2 status
echo ""

# 4. Check PM2 Logs (Errors)
echo -e "${YELLOW}4. Recent PM2 Errors (Last 20 lines):${NC}"
pm2 logs dialexportmart --err --lines 20 --nostream 2>/dev/null || echo "No error logs found"
echo ""

# 5. Check Port 3000
echo -e "${YELLOW}5. Checking Port 3000...${NC}"
if sudo lsof -i :3000 > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Port 3000 is in use:${NC}"
    sudo lsof -i :3000
else
    echo -e "${GREEN}✅ Port 3000 is free${NC}"
fi
echo ""

# 6. Check Node.js
echo -e "${YELLOW}6. Checking Node.js...${NC}"
if command -v node &> /dev/null; then
    echo -e "${GREEN}✅ Node.js version: $(node -v)${NC}"
else
    echo -e "${RED}❌ Node.js not found!${NC}"
fi
echo ""

# 7. Check Nginx
echo -e "${YELLOW}7. Checking Nginx...${NC}"
if systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✅ Nginx is running${NC}"
    if sudo nginx -t 2>&1 | grep -q "successful"; then
        echo -e "${GREEN}✅ Nginx config is valid${NC}"
    else
        echo -e "${RED}❌ Nginx config has errors:${NC}"
        sudo nginx -t
    fi
else
    echo -e "${RED}❌ Nginx is not running!${NC}"
fi
echo ""

# 8. Test Local Connection
echo -e "${YELLOW}8. Testing Local Connection...${NC}"
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ App is responding on localhost:3000${NC}"
else
    echo -e "${RED}❌ App is NOT responding on localhost:3000${NC}"
    echo -e "${YELLOW}   This means the Next.js app is not running${NC}"
fi
echo ""

# 9. Check Logs Directory
echo -e "${YELLOW}9. Checking Logs Directory...${NC}"
if [ -d "logs" ]; then
    echo -e "${GREEN}✅ Logs directory exists${NC}"
    if [ -f "logs/pm2-error.log" ]; then
        echo -e "${YELLOW}   Last 5 lines of error log:${NC}"
        tail -5 logs/pm2-error.log
    fi
else
    echo -e "${YELLOW}⚠️  Logs directory missing (will be created on start)${NC}"
fi
echo ""

# Summary
echo "=========================================="
echo "📊 Summary:"
echo "=========================================="

ISSUES=0

[ ! -d ".next" ] && { echo "❌ Build missing"; ISSUES=$((ISSUES+1)); }
[ ! -f ".env" ] && { echo "❌ .env missing"; ISSUES=$((ISSUES+1)); }
! pm2 list | grep -q "dialexportmart.*online" && { echo "❌ PM2 process not online"; ISSUES=$((ISSUES+1)); }
! curl -s http://localhost:3000 > /dev/null && { echo "❌ App not responding"; ISSUES=$((ISSUES+1)); }

if [ $ISSUES -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed!${NC}"
else
    echo -e "${RED}❌ Found $ISSUES issue(s)${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Check PM2 logs: pm2 logs dialexportmart --err --lines 50"
    echo "2. Follow SITE_NOT_LIVE_FIX.md for detailed fixes"
fi

echo ""
