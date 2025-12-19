#!/bin/bash

# 🚀 Quick Deployment Script for Dial Export Mart
# Usage: chmod +x deploy.sh && ./deploy.sh

set -e  # Exit on error

echo "=========================================="
echo "🚀 Dial Export Mart - Production Deployment"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Stop old process
echo -e "${YELLOW}🛑 Step 1: Stopping old process...${NC}"
pm2 stop dialexportmart 2>/dev/null || echo "No existing process to stop"
sleep 2

# Step 2: Git pull
echo -e "${YELLOW}📥 Step 2: Pulling latest code...${NC}"
git pull origin main || git pull origin master || {
    echo -e "${RED}❌ Git pull failed. Please check your git repository.${NC}"
    exit 1
}

# Step 3: Install dependencies
echo -e "${YELLOW}📦 Step 3: Installing dependencies...${NC}"
npm install --production || npm install

# Step 4: Check .env file
echo -e "${YELLOW}🔍 Step 4: Checking environment variables...${NC}"
if [ ! -f .env ]; then
    echo -e "${RED}❌ .env file not found! Please create it.${NC}"
    exit 1
fi

# Step 5: Build
echo -e "${YELLOW}🔨 Step 5: Building application...${NC}"
npm run build || {
    echo -e "${RED}❌ Build failed! Please check errors above.${NC}"
    exit 1
}

# Step 6: Delete old PM2 process
echo -e "${YELLOW}🗑️  Step 6: Cleaning up old PM2 process...${NC}"
pm2 delete dialexportmart 2>/dev/null || echo "No old process to delete"

# Step 7: Start with PM2
echo -e "${YELLOW}🚀 Step 7: Starting application with PM2...${NC}"
pm2 start npm --name "dialexportmart" -- start

# Step 8: Save PM2 configuration
echo -e "${YELLOW}💾 Step 8: Saving PM2 configuration...${NC}"
pm2 save

# Step 9: Show status
echo -e "${GREEN}✅ Deployment complete!${NC}"
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
echo "3. Check CPU: top"
echo "4. Verify site: https://www.dialexportmart.com"
echo ""
echo -e "${GREEN}✅ All done! Your optimized site is now live!${NC}"

