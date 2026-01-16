# 🚀 Complete VPS Deployment Guide - Dial Export Mart

## 📋 Prerequisites:
- VPS server with Ubuntu 22.04 LTS (or similar)
- Domain name pointing to VPS IP
- SSH access to VPS
- MongoDB database (Atlas or self-hosted)

---

## 🔧 STEP 1: Initial Server Setup (One Time)

### Connect to VPS:

```bash
# SSH into your VPS
ssh root@your-vps-ip
# or
ssh username@your-vps-ip
```

### Update System:

```bash
# Update package list
sudo apt update && sudo apt upgrade -y

# Install essential tools
sudo apt install -y curl wget git build-essential
```

### Install Node.js 20.x:

```bash
# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version  # Should show v20.x.x
npm --version
```

### Install PM2:

```bash
# Install PM2 globally
sudo npm install -g pm2

# Verify installation
pm2 --version

# Setup PM2 to start on boot
pm2 startup
# Follow the command it shows (usually: sudo env PATH=... pm2 startup systemd -u username --hp /home/username)
```

### Install Nginx:

```bash
# Install Nginx
sudo apt install -y nginx

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Check status
sudo systemctl status nginx
```

### Install Certbot (for SSL):

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx
```

### Setup Firewall:

```bash
# Enable firewall
sudo ufw --force enable

# Allow SSH
sudo ufw allow 22/tcp

# Allow HTTP
sudo ufw allow 80/tcp

# Allow HTTPS
sudo ufw allow 443/tcp

# Check status
sudo ufw status
```

---

## 📁 STEP 2: Project Setup

### Create Project Directory:

```bash
# Create project directory
sudo mkdir -p /var/www/dialexportmart
sudo chown -R $USER:$USER /var/www/dialexportmart

# Navigate to directory
cd /var/www/dialexportmart
```

### Clone Repository (or Upload Code):

**Option A: Git Clone**
```bash
# Clone your repository
git clone https://github.com/yourusername/your-repo.git .

# Or if repository already exists, pull latest
git pull origin main
```

**Option B: Upload via SCP**
```bash
# From your local machine
scp -r /path/to/local/project/* username@vps-ip:/var/www/dialexportmart/
```

### Install Dependencies:

```bash
# Navigate to project
cd /var/www/dialexportmart

# Install dependencies
npm install
```

---

## 🔐 STEP 3: Environment Variables Setup

### Create .env File:

```bash
# Create .env file
nano .env
```

### Add Required Variables:

```env
# MongoDB Connection
MONGODB_URI=mongodb://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
# OR for local MongoDB
# MONGODB_URI=mongodb://localhost:27017/dialexportmart

# Next.js Configuration
NEXT_PUBLIC_BASE_URL=https://www.dialexportmart.com
NEXT_PUBLIC_API_BASE_URL=https://www.dialexportmart.com

# NextAuth (if using)
NEXTAUTH_URL=https://www.dialexportmart.com
NEXTAUTH_SECRET=your-secret-key-here
# Generate secret: openssl rand -base64 32

# Node Environment
NODE_ENV=production
PORT=3000

# Cloudinary (if using)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# JWT Secret (if using)
JWT_SECRET=your-jwt-secret-here
# Generate: openssl rand -base64 32
```

**Save and Exit:**
- Press `Ctrl + X`
- Press `Y` to confirm
- Press `Enter` to save

### Secure .env File:

```bash
# Set proper permissions
chmod 600 .env
```

---

## 🏗️ STEP 4: Build Application

```bash
# Make sure you're in project directory
cd /var/www/dialexportmart

# Build the application
npm run build

# Check for build errors
# If successful, you'll see: "✓ Compiled successfully"
```

---

## ⚙️ STEP 5: Configure Nginx

### Create Nginx Configuration:

```bash
# Create nginx config file
sudo nano /etc/nginx/sites-available/dialexportmart
```

### Add Nginx Configuration:

```nginx
server {
    listen 80;
    server_name dialexportmart.com www.dialexportmart.com;

    # Redirect HTTP to HTTPS (after SSL setup)
    # Uncomment after SSL certificate is installed
    # return 301 https://$server_name$request_uri;

    # For now, proxy to Next.js (remove after SSL setup)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Increase timeouts for large requests
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;
}

# After SSL setup, use this configuration instead:
# server {
#     listen 80;
#     server_name dialexportmart.com www.dialexportmart.com;
#     return 301 https://$server_name$request_uri;
# }
#
# server {
#     listen 443 ssl http2;
#     server_name dialexportmart.com www.dialexportmart.com;
#
#     ssl_certificate /etc/letsencrypt/live/dialexportmart.com/fullchain.pem;
#     ssl_certificate_key /etc/letsencrypt/live/dialexportmart.com/privkey.pem;
#
#     # SSL Configuration
#     ssl_protocols TLSv1.2 TLSv1.3;
#     ssl_ciphers HIGH:!aNULL:!MD5;
#     ssl_prefer_server_ciphers on;
#
#     # Security Headers
#     add_header X-Frame-Options "DENY" always;
#     add_header X-Content-Type-Options "nosniff" always;
#     add_header X-XSS-Protection "1; mode=block" always;
#     add_header Referrer-Policy "strict-origin-when-cross-origin" always;
#
#     location / {
#         proxy_pass http://localhost:3000;
#         proxy_http_version 1.1;
#         proxy_set_header Upgrade $http_upgrade;
#         proxy_set_header Connection 'upgrade';
#         proxy_set_header Host $host;
#         proxy_set_header X-Real-IP $remote_addr;
#         proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
#         proxy_set_header X-Forwarded-Proto $scheme;
#         proxy_cache_bypass $http_upgrade;
#     }
# }
```

**Save and Exit:** `Ctrl + X`, `Y`, `Enter`

### Enable Site:

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/dialexportmart /etc/nginx/sites-enabled/

# Remove default site (optional)
sudo rm /etc/nginx/sites-enabled/default

# Test nginx configuration
sudo nginx -t

# If test passes, reload nginx
sudo systemctl reload nginx
```

---

## 🚀 STEP 6: Start Application with PM2

### Start with PM2:

```bash
# Navigate to project
cd /var/www/dialexportmart

# Create logs directory
mkdir -p logs

# Start application with PM2
pm2 start ecosystem.config.cjs

# Save PM2 configuration
pm2 save

# Check status
pm2 status

# View logs
pm2 logs dialexportmart --lines 50
```

### Verify Application is Running:

```bash
# Check if app is listening on port 3000
sudo netstat -tulpn | grep 3000
# or
sudo ss -tulpn | grep 3000

# Test locally
curl http://localhost:3000
```

---

## 🔒 STEP 7: Setup SSL Certificate

### Get SSL Certificate:

```bash
# Get SSL certificate
sudo certbot --nginx -d dialexportmart.com -d www.dialexportmart.com

# Follow prompts:
# - Enter email address
# - Agree to terms
# - Choose redirect HTTP to HTTPS (option 2)
```

### Auto-Renewal Setup:

```bash
# Test renewal
sudo certbot renew --dry-run

# Certbot automatically sets up renewal, but verify:
sudo systemctl status certbot.timer
```

### Update Nginx Config (if needed):

After SSL setup, Certbot automatically updates nginx config. Verify:

```bash
# Check nginx config
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

---

## ✅ STEP 8: Verify Deployment

### Check PM2 Status:

```bash
pm2 status
pm2 logs dialexportmart --lines 20
```

### Check Nginx Status:

```bash
sudo systemctl status nginx
sudo nginx -t
```

### Test Website:

1. **HTTP Test:**
   ```bash
   curl -I http://dialexportmart.com
   ```

2. **HTTPS Test:**
   ```bash
   curl -I https://dialexportmart.com
   ```

3. **Browser Test:**
   - Visit: `https://www.dialexportmart.com`
   - Check homepage loads
   - Check product pages
   - Test API endpoints

### Check Logs:

```bash
# PM2 logs
pm2 logs dialexportmart

# Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Nginx access logs
sudo tail -f /var/log/nginx/access.log
```

---

## 🔄 STEP 9: Post-Deployment Setup

### Setup Auto-Restart on Server Reboot:

```bash
# PM2 startup (if not done earlier)
pm2 startup
# Run the command it shows

# Save PM2 configuration
pm2 save
```

### Setup Monitoring:

```bash
# Monitor application
pm2 monit

# Or check status
pm2 status
```

### Setup Log Rotation:

```bash
# PM2 has built-in log rotation
pm2 install pm2-logrotate

# Configure log rotation
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

---

## 🛠️ STEP 10: Troubleshooting

### Application Not Starting:

```bash
# Check PM2 logs
pm2 logs dialexportmart --err

# Check if port is in use
sudo lsof -i :3000

# Restart application
pm2 restart dialexportmart
```

### 502 Bad Gateway:

```bash
# Check if app is running
pm2 status

# Check if app is listening
sudo netstat -tulpn | grep 3000

# Check nginx error logs
sudo tail -50 /var/log/nginx/error.log

# Restart both
pm2 restart dialexportmart
sudo systemctl reload nginx
```

### Database Connection Issues:

```bash
# Check .env file
cat .env | grep MONGODB_URI

# Test MongoDB connection
node -e "require('dotenv').config(); const mongoose = require('mongoose'); mongoose.connect(process.env.MONGODB_URI).then(() => console.log('Connected')).catch(e => console.error(e))"
```

### High Memory Usage:

```bash
# Check memory
free -h

# Check PM2 memory
pm2 monit

# Restart if needed
pm2 restart dialexportmart
```

---

## 📋 Quick Deployment Commands (After Initial Setup):

### Daily Deployment:

```bash
cd /var/www/dialexportmart
git pull origin main
npm install
npm run build
pm2 restart dialexportmart
```

### Or Use Deploy Script:

```bash
cd /var/www/dialexportmart
chmod +x deploy.sh
./deploy.sh
```

---

## 🎯 Complete Deployment Checklist:

### Initial Setup:
- [ ] Server updated
- [ ] Node.js installed
- [ ] PM2 installed
- [ ] Nginx installed
- [ ] Certbot installed
- [ ] Firewall configured

### Application Setup:
- [ ] Project directory created
- [ ] Code deployed
- [ ] Dependencies installed
- [ ] .env file created
- [ ] Application built

### Server Configuration:
- [ ] Nginx configured
- [ ] SSL certificate installed
- [ ] PM2 started
- [ ] Auto-startup configured

### Verification:
- [ ] Website loads on HTTP
- [ ] Website loads on HTTPS
- [ ] No redirects to malicious sites
- [ ] Database connection working
- [ ] PM2 running without errors
- [ ] Logs showing no errors

---

## 🚀 Quick Start (If Server Already Setup):

```bash
# 1. Navigate to project
cd /var/www/dialexportmart

# 2. Pull latest code
git pull origin main

# 3. Install dependencies
npm install

# 4. Create/update .env file
nano .env
# Add all required variables

# 5. Build
npm run build

# 6. Start with PM2
pm2 start ecosystem.config.cjs
pm2 save

# 7. Setup Nginx (if not done)
sudo nano /etc/nginx/sites-available/dialexportmart
# Add configuration (see above)

# 8. Enable site
sudo ln -s /etc/nginx/sites-available/dialexportmart /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# 9. Setup SSL
sudo certbot --nginx -d dialexportmart.com -d www.dialexportmart.com

# 10. Verify
pm2 status
curl https://www.dialexportmart.com
```

---

## 📞 Need Help?

### Common Issues:

1. **Port 3000 already in use:**
   ```bash
   sudo lsof -i :3000
   sudo kill -9 <PID>
   ```

2. **Permission denied:**
   ```bash
   sudo chown -R $USER:$USER /var/www/dialexportmart
   ```

3. **Build fails:**
   ```bash
   rm -rf .next node_modules
   npm install
   npm run build
   ```

4. **Nginx 502 error:**
   ```bash
   pm2 restart dialexportmart
   sudo systemctl reload nginx
   ```

---

## ✅ Success Indicators:

- ✅ Website loads at `https://www.dialexportmart.com`
- ✅ PM2 shows status "online"
- ✅ No errors in PM2 logs
- ✅ Nginx status "active"
- ✅ SSL certificate valid
- ✅ Database connection working
- ✅ No malicious redirects

**Your website is now live on VPS! 🎉**
