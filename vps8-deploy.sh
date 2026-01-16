#!/bin/bash

# 🚀 VPS8 Deployment Script for Dial Export Mart
# Usage: chmod +x vps8-deploy.sh && ./vps8-deploy.sh

set -e  # Exit on error

echo "=========================================="
echo "🚀 Dial Export Mart - VPS8 Deployment"
echo "=========================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Project directory
PROJECT_DIR="/var/www/dialexportmart"

# Step 1: Navigate to project
echo -e "${YELLOW}📁 Step 1: Navigating to project directory...${NC}"
if [ ! -d "$PROJECT_DIR" ]; then
    echo -e "${YELLOW}Creating project directory...${NC}"
    sudo mkdir -p $PROJECT_DIR
    sudo chown -R $USER:$USER $PROJECT_DIR
fi
cd $PROJECT_DIR || {
    echo -e "${RED}❌ Cannot access project directory!${NC}"
    exit 1
}
echo -e "${GREEN}✅ In project directory: $PROJECT_DIR${NC}"

# Step 2: Check .env file
echo -e "${YELLOW}🔍 Step 2: Checking .env file...${NC}"
if [ ! -f .env ]; then
    echo -e "${RED}❌ .env file not found!${NC}"
    echo -e "${YELLOW}Creating .env file template...${NC}"
    cat > .env << EOF
# MongoDB Connection
MONGODB_URI=mongodb://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority

# Next.js Configuration
NEXT_PUBLIC_BASE_URL=https://www.dialexportmart.com
NEXT_PUBLIC_API_BASE_URL=https://www.dialexportmart.com

# Node Environment
NODE_ENV=production
PORT=3000
EOF
    echo -e "${YELLOW}⚠️  Please edit .env file with your actual values!${NC}"
    echo -e "${YELLOW}Run: nano .env${NC}"
    read -p "Press Enter after updating .env file..."
fi
echo -e "${GREEN}✅ .env file exists${NC}"

# Step 3: Git pull (if using git)
echo -e "${YELLOW}📥 Step 3: Updating code...${NC}"
if [ -d .git ]; then
    git pull origin main || git pull origin master || {
        echo -e "${YELLOW}⚠️  Git pull failed or no changes${NC}"
    }
    echo -e "${GREEN}✅ Code updated${NC}"
else
    echo -e "${YELLOW}⚠️  Not a git repository, skipping pull${NC}"
fi

# Step 4: Install dependencies
echo -e "${YELLOW}📦 Step 4: Installing dependencies...${NC}"
npm install || {
    echo -e "${RED}❌ npm install failed!${NC}"
    exit 1
}
echo -e "${GREEN}✅ Dependencies installed${NC}"

# Step 5: Build application
echo -e "${YELLOW}🔨 Step 5: Building application...${NC}"
npm run build || {
    echo -e "${RED}❌ Build failed! Check errors above.${NC}"
    exit 1
}
echo -e "${GREEN}✅ Build successful${NC}"

# Step 6: Create logs directory
echo -e "${YELLOW}📁 Step 6: Creating logs directory...${NC}"
mkdir -p logs
echo -e "${GREEN}✅ Logs directory ready${NC}"

# Step 7: Stop old PM2 process
echo -e "${YELLOW}🛑 Step 7: Stopping old PM2 process...${NC}"
pm2 stop dialexportmart 2>/dev/null || echo "No process to stop"
sleep 2

# Step 8: Delete old PM2 process
echo -e "${YELLOW}🗑️  Step 8: Cleaning up old PM2 process...${NC}"
pm2 delete dialexportmart 2>/dev/null || echo "No process to delete"

# Step 9: Start with PM2
echo -e "${YELLOW}🚀 Step 9: Starting application with PM2...${NC}"
if [ -f "ecosystem.config.cjs" ]; then
    pm2 start ecosystem.config.cjs
    echo -e "${GREEN}✅ Started with ecosystem.config.cjs${NC}"
elif [ -f "ecosystem.config.js" ]; then
    pm2 start ecosystem.config.js
    echo -e "${GREEN}✅ Started with ecosystem.config.js${NC}"
else
    pm2 start npm --name "dialexportmart" -- start
    echo -e "${GREEN}✅ Started with fallback method${NC}"
fi

# Step 10: Save PM2 configuration
echo -e "${YELLOW}💾 Step 10: Saving PM2 configuration...${NC}"
pm2 save
echo -e "${GREEN}✅ PM2 configuration saved${NC}"

# Step 11: Check Nginx configuration
echo -e "${YELLOW}🌐 Step 11: Checking Nginx configuration...${NC}"
if [ -f "/etc/nginx/sites-available/dialexportmart" ]; then
    sudo nginx -t && sudo systemctl reload nginx
    echo -e "${GREEN}✅ Nginx reloaded${NC}"
else
    echo -e "${YELLOW}⚠️  Nginx config not found. Please setup nginx manually.${NC}"
    echo -e "${YELLOW}See: VPS_DEPLOYMENT_GUIDE.md for nginx setup${NC}"
fi

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
echo "4. Setup SSL: sudo certbot --nginx -d dialexportmart.com -d www.dialexportmart.com"
echo ""
echo -e "${GREEN}✅ Deployment complete!${NC}"
