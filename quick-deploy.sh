#!/bin/bash

# 🚀 Quick Deployment Script for VPS
# Usage: chmod +x quick-deploy.sh && ./quick-deploy.sh

set -e  # Exit on error

echo "=========================================="
echo "🚀 Dial Export Mart - Quick Deployment"
echo "=========================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Step 1: Navigate to project
echo -e "${YELLOW}📁 Step 1: Navigating to project directory...${NC}"
cd /var/www/DEM || {
    echo -e "${RED}❌ Directory /var/www/DEM not found!${NC}"
    exit 1
}

# Step 2: Cleanup old files
echo -e "${YELLOW}🧹 Step 2: Cleaning up old files...${NC}"
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
npm install --production || npm install
echo -e "${GREEN}✅ Dependencies installed${NC}"

# Step 5: Check .env file
echo -e "${YELLOW}🔍 Step 5: Checking environment variables...${NC}"
if [ ! -f .env ]; then
    echo -e "${RED}⚠️  .env file not found!${NC}"
    echo "Please create .env file with required variables"
fi

# Step 6: Build
echo -e "${YELLOW}🔨 Step 6: Building application...${NC}"
npm run build || {
    echo -e "${RED}❌ Build failed! Check errors above.${NC}"
    exit 1
}
echo -e "${GREEN}✅ Build successful${NC}"

# Step 7: Stop old PM2 process
echo -e "${YELLOW}🛑 Step 7: Stopping old process...${NC}"
pm2 stop dialexportmart 2>/dev/null || echo "No process to stop"
pm2 delete dialexportmart 2>/dev/null || echo "No process to delete"

# Step 8: Start with PM2
echo -e "${YELLOW}🚀 Step 8: Starting application...${NC}"
pm2 start npm --name "dialexportmart" -- start
echo -e "${GREEN}✅ Application started${NC}"

# Step 9: Save PM2 config
echo -e "${YELLOW}💾 Step 9: Saving PM2 configuration...${NC}"
pm2 save
echo -e "${GREEN}✅ Configuration saved${NC}"

# Step 10: Show status
echo ""
echo "=========================================="
echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo "=========================================="
echo ""
pm2 status
echo ""
echo "=========================================="
echo "📊 Next Steps:"
echo "=========================================="
echo "1. Monitor: pm2 monit"
echo "2. Logs: pm2 logs dialexportmart --lines 50"
echo "3. Check CPU: top"
echo "4. Verify site: https://www.dialexportmart.com"
echo ""






