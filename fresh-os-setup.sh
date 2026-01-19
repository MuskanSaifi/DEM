#!/bin/bash

# 🚀 Fresh OS Setup Script for Dial Export Mart
# Usage: chmod +x fresh-os-setup.sh && ./fresh-os-setup.sh

set -e  # Exit on error

echo "=========================================="
echo "🚀 Dial Export Mart - Fresh OS Setup"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}❌ Please run as root or with sudo${NC}"
    exit 1
fi

# STEP 1: Update System
echo -e "${YELLOW}📦 Step 1: Updating system...${NC}"
apt update && apt upgrade -y
apt install -y curl wget git build-essential
echo -e "${GREEN}✅ System updated${NC}"
echo ""

# STEP 2: Install Node.js 20.x
echo -e "${YELLOW}📦 Step 2: Installing Node.js 20.x...${NC}"
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✅ Node.js already installed: $NODE_VERSION${NC}"
else
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt install -y nodejs
    echo -e "${GREEN}✅ Node.js installed: $(node --version)${NC}"
fi
echo ""

# STEP 3: Install PM2
echo -e "${YELLOW}📦 Step 3: Installing PM2...${NC}"
if command -v pm2 &> /dev/null; then
    echo -e "${GREEN}✅ PM2 already installed: $(pm2 --version)${NC}"
else
    npm install -g pm2
    echo -e "${GREEN}✅ PM2 installed${NC}"
fi
echo ""

# STEP 4: Install Nginx
echo -e "${YELLOW}📦 Step 4: Installing Nginx...${NC}"
if command -v nginx &> /dev/null; then
    echo -e "${GREEN}✅ Nginx already installed${NC}"
else
    apt install -y nginx
    systemctl start nginx
    systemctl enable nginx
    echo -e "${GREEN}✅ Nginx installed and started${NC}"
fi
echo ""

# STEP 5: Install Certbot
echo -e "${YELLOW}📦 Step 5: Installing Certbot...${NC}"
if command -v certbot &> /dev/null; then
    echo -e "${GREEN}✅ Certbot already installed${NC}"
else
    apt install -y certbot python3-certbot-nginx
    echo -e "${GREEN}✅ Certbot installed${NC}"
fi
echo ""

# STEP 6: Setup Firewall
echo -e "${YELLOW}🔥 Step 6: Configuring firewall...${NC}"
ufw --force enable
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
echo -e "${GREEN}✅ Firewall configured${NC}"
echo ""

# STEP 7: Create Project Directory
echo -e "${YELLOW}📁 Step 7: Creating project directory...${NC}"
mkdir -p /var/www/dialexportmart
chown -R $SUDO_USER:$SUDO_USER /var/www/dialexportmart
echo -e "${GREEN}✅ Directory created: /var/www/dialexportmart${NC}"
echo ""

# STEP 8: Setup PM2 Startup
echo -e "${YELLOW}⚙️  Step 8: Setting up PM2 startup...${NC}"
pm2 startup systemd -u $SUDO_USER --hp /home/$SUDO_USER 2>/dev/null || {
    echo -e "${YELLOW}⚠️  PM2 startup command needs to be run manually${NC}"
    echo -e "${YELLOW}   Run: pm2 startup${NC}"
}
echo ""

echo "=========================================="
echo "✅ Server Setup Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Navigate to project: cd /var/www/dialexportmart"
echo "2. Upload/clone your code"
echo "3. Install dependencies: npm install"
echo "4. Create .env file with required variables"
echo "5. Build: npm run build"
echo "6. Start with PM2: pm2 start ecosystem.config.cjs"
echo "7. Setup Nginx: See FRESH_OS_SETUP.md"
echo "8. Setup SSL: sudo certbot --nginx -d dialexportmart.com -d www.dialexportmart.com"
echo ""
echo "For detailed steps, see: FRESH_OS_SETUP.md"
echo ""
