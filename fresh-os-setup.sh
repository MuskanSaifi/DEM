#!/bin/bash

# 🚀 Fresh OS Setup Script for Dial Export Mart
# Run this after OS reinstall
# Usage: chmod +x fresh-os-setup.sh && sudo ./fresh-os-setup.sh

set -e

echo "=========================================="
echo "🚀 Fresh OS Setup - Dial Export Mart"
echo "=========================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Please run as root or with sudo${NC}"
    exit 1
fi

# Step 1: Update System
echo -e "${YELLOW}📦 Step 1: Updating system...${NC}"
apt update && apt upgrade -y
apt install -y curl wget git build-essential
echo -e "${GREEN}✅ System updated${NC}"

# Step 2: Install Node.js
echo -e "${YELLOW}📦 Step 2: Installing Node.js 20.x...${NC}"
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
echo -e "${GREEN}✅ Node.js installed: $(node --version)${NC}"

# Step 3: Install PM2
echo -e "${YELLOW}📦 Step 3: Installing PM2...${NC}"
npm install -g pm2
echo -e "${GREEN}✅ PM2 installed: $(pm2 --version)${NC}"

# Step 4: Install Nginx
echo -e "${YELLOW}📦 Step 4: Installing Nginx...${NC}"
apt install -y nginx
systemctl start nginx
systemctl enable nginx
echo -e "${GREEN}✅ Nginx installed and started${NC}"

# Step 5: Install Certbot
echo -e "${YELLOW}📦 Step 5: Installing Certbot...${NC}"
apt install -y certbot python3-certbot-nginx
echo -e "${GREEN}✅ Certbot installed${NC}"

# Step 6: Setup Firewall
echo -e "${YELLOW}🔥 Step 6: Setting up firewall...${NC}"
ufw --force enable
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
echo -e "${GREEN}✅ Firewall configured${NC}"

# Step 7: Install Security Tools
echo -e "${YELLOW}🛡️  Step 7: Installing security tools...${NC}"
apt install -y fail2ban
systemctl start fail2ban
systemctl enable fail2ban
echo -e "${GREEN}✅ Security tools installed${NC}"

# Step 8: Create Project Directory
echo -e "${YELLOW}📁 Step 8: Creating project directory...${NC}"
mkdir -p /var/www/DEM
echo -e "${GREEN}✅ Directory created: /var/www/DEM${NC}"

echo ""
echo "=========================================="
echo -e "${GREEN}✅ Basic Setup Complete!${NC}"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Clone your repository:"
echo "   cd /var/www/DEM"
echo "   git clone https://github.com/yourusername/your-repo.git ."
echo ""
echo "2. Create .env file with all required variables"
echo ""
echo "3. Install dependencies: npm install"
echo ""
echo "4. Build application: npm run build"
echo ""
echo "5. Start with PM2: pm2 start ecosystem.config.cjs"
echo ""
echo "6. Setup PM2 startup: pm2 startup systemd"
echo ""
echo "7. Configure Nginx (see COMPLETE_DEPLOYMENT_GUIDE.md)"
echo ""
echo "8. Setup SSL: certbot --nginx -d domain.com -d www.domain.com"
echo ""
echo -e "${YELLOW}See COMPLETE_DEPLOYMENT_GUIDE.md for detailed steps${NC}"



