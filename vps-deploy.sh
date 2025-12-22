#!/bin/bash

# 🚀 VPS Clean Deploy Script
# Usage: chmod +x vps-deploy.sh && ./vps-deploy.sh

set -e  # Exit on error

echo "=========================================="
echo "🚀 VPS Clean Deploy - Dial Export Mart"
echo "=========================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Step 1: Navigate to project
echo -e "${YELLOW}📁 Step 1: Navigating to project directory...${NC}"
cd /var/www/DEM || {
    echo -e "${RED}❌ Directory /var/www/DEM not found!${NC}"
    exit 1
}
echo -e "${GREEN}✅ In project directory${NC}"

# Step 2: Clean old files
echo -e "${YELLOW}🧹 Step 2: Cleaning old build and node_modules...${NC}"
rm -rf .next
rm -rf node_modules
echo -e "${GREEN}✅ Cleanup complete${NC}"

# Step 3: Git pull
echo -e "${YELLOW}📥 Step 3: Pulling latest code...${NC}"
git pull origin main || {
    echo -e "${RED}❌ Git pull failed!${NC}"
    exit 1
}
echo -e "${GREEN}✅ Code updated${NC}"

# Step 4: Install dependencies
echo -e "${YELLOW}📦 Step 4: Installing dependencies...${NC}"
npm install || {
    echo -e "${RED}❌ npm install failed!${NC}"
    exit 1
}
echo -e "${GREEN}✅ Dependencies installed${NC}"

# Step 5: Check .env file
echo -e "${YELLOW}🔍 Step 5: Checking .env file...${NC}"
if [ ! -f .env ]; then
    echo -e "${RED}⚠️  .env file not found!${NC}"
    echo "Please create .env file with required variables"
else
    echo -e "${GREEN}✅ .env file exists${NC}"
fi

# Step 6: Build
echo -e "${YELLOW}🔨 Step 6: Building application...${NC}"
npm run build || {
    echo -e "${RED}❌ Build failed! Check errors above.${NC}"
    exit 1
}
echo -e "${GREEN}✅ Build successful${NC}"

# Step 7: Create logs directory
echo -e "${YELLOW}📁 Step 7: Creating logs directory...${NC}"
mkdir -p logs
echo -e "${GREEN}✅ Logs directory ready${NC}"

# Step 8: Stop old PM2 process
echo -e "${YELLOW}🛑 Step 8: Stopping old PM2 process...${NC}"
pm2 stop dialexportmart 2>/dev/null || echo "No process to stop"
sleep 2

# Step 9: Delete old PM2 process
echo -e "${YELLOW}🗑️  Step 9: Deleting old PM2 process...${NC}"
pm2 delete dialexportmart 2>/dev/null || echo "No process to delete"

# Step 10: Start with PM2 using ecosystem config
echo -e "${YELLOW}🚀 Step 10: Starting application with PM2...${NC}"
if [ -f "ecosystem.config.js" ]; then
    pm2 start ecosystem.config.js
    echo -e "${GREEN}✅ Started with ecosystem.config.js${NC}"
else
    echo -e "${RED}⚠️  ecosystem.config.js not found, using fallback...${NC}"
    pm2 start npm --name "dialexportmart" -- start
fi

# Step 11: Save PM2 configuration
echo -e "${YELLOW}💾 Step 11: Saving PM2 configuration...${NC}"
pm2 save
echo -e "${GREEN}✅ PM2 configuration saved${NC}"

# Step 12: Show status
echo ""
echo "=========================================="
echo "📊 Application Status:"
echo "=========================================="
pm2 status

echo ""
echo "=========================================="
echo "📝 Next Steps:"
echo "=========================================="
echo "1. Monitor: pm2 monit"
echo "2. Logs: pm2 logs dialexportmart --lines 50"
echo "3. Check site: https://www.dialexportmart.com"
echo ""
echo -e "${GREEN}✅ Deployment complete!${NC}"

