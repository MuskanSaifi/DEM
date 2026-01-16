# ⚡ VPS8 Quick Start Guide

## 🚀 Fast Deployment (15 Minutes)

### Prerequisites Check:

```bash
# Check Node.js
node --version  # Should be v20.x.x

# Check PM2
pm2 --version

# Check Nginx
nginx -v

# Check Git
git --version
```

---

## 📋 Step-by-Step Deployment:

### 1. Connect to VPS8:

```bash
ssh root@your-vps8-ip
# or
ssh username@your-vps8-ip
```

### 2. Initial Setup (One Time Only):

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx

# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Setup firewall
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable
```

### 3. Project Setup:

```bash
# Create project directory
sudo mkdir -p /var/www/dialexportmart
sudo chown -R $USER:$USER /var/www/dialexportmart
cd /var/www/dialexportmart

# Clone or upload your code
git clone https://github.com/yourusername/your-repo.git .
# OR upload via SCP from local machine
```

### 4. Environment Variables:

```bash
# Create .env file
nano .env
```

**Add these variables:**
```env
MONGODB_URI=mongodb://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
NEXT_PUBLIC_BASE_URL=https://www.dialexportmart.com
NEXT_PUBLIC_API_BASE_URL=https://www.dialexportmart.com
NODE_ENV=production
PORT=3000
```

**Save:** `Ctrl+X`, `Y`, `Enter`

### 5. Install & Build:

```bash
# Install dependencies
npm install

# Build application
npm run build
```

### 6. Setup Nginx:

```bash
# Copy nginx config
sudo cp nginx-dialexportmart.conf /etc/nginx/sites-available/dialexportmart

# Edit if needed
sudo nano /etc/nginx/sites-available/dialexportmart

# Enable site
sudo ln -s /etc/nginx/sites-available/dialexportmart /etc/nginx/sites-enabled/

# Remove default
sudo rm /etc/nginx/sites-enabled/default

# Test and reload
sudo nginx -t
sudo systemctl reload nginx
```

### 7. Start Application:

```bash
# Start with PM2
pm2 start ecosystem.config.cjs

# Save PM2 config
pm2 save

# Setup auto-start
pm2 startup
# Run the command it shows
```

### 8. Setup SSL:

```bash
# Get SSL certificate
sudo certbot --nginx -d dialexportmart.com -d www.dialexportmart.com

# Follow prompts and choose option 2 (redirect HTTP to HTTPS)
```

### 9. Verify:

```bash
# Check PM2
pm2 status
pm2 logs dialexportmart --lines 20

# Test website
curl https://www.dialexportmart.com

# Check in browser
# Visit: https://www.dialexportmart.com
```

---

## 🔄 Quick Deploy Script (After Initial Setup):

```bash
# Make script executable
chmod +x vps8-deploy.sh

# Run deployment
./vps8-deploy.sh
```

---

## 📝 Important Commands:

### Daily Operations:

```bash
# View logs
pm2 logs dialexportmart

# Restart application
pm2 restart dialexportmart

# Check status
pm2 status

# Monitor
pm2 monit
```

### Update Code:

```bash
cd /var/www/dialexportmart
git pull origin main
npm install
npm run build
pm2 restart dialexportmart
```

### Nginx Commands:

```bash
# Test config
sudo nginx -t

# Reload
sudo systemctl reload nginx

# Restart
sudo systemctl restart nginx

# View logs
sudo tail -f /var/log/nginx/error.log
```

---

## ✅ Verification Checklist:

- [ ] Website loads at https://www.dialexportmart.com
- [ ] PM2 shows status "online"
- [ ] No errors in logs
- [ ] SSL certificate valid
- [ ] Database connection working
- [ ] No malicious redirects

---

## 🆘 Troubleshooting:

### Website Not Loading:

```bash
# Check PM2
pm2 status
pm2 logs dialexportmart --err

# Check Nginx
sudo nginx -t
sudo tail -50 /var/log/nginx/error.log

# Check port
sudo netstat -tulpn | grep 3000
```

### 502 Bad Gateway:

```bash
# Restart everything
pm2 restart dialexportmart
sudo systemctl reload nginx
```

### Build Fails:

```bash
# Clean and rebuild
rm -rf .next node_modules
npm install
npm run build
```

---

**Your website should be live now! 🎉**
