# ⚡ Quick Reference - Common Commands

## 🚀 Initial Setup (One Time)

```bash
# Run after OS reinstall
chmod +x fresh-os-setup.sh
sudo ./fresh-os-setup.sh
```

## 📁 Project Setup

```bash
# Navigate to project
cd /var/www/DEM

# Clone repository
git clone https://github.com/yourusername/your-repo.git .

# Create .env file
nano .env
# Add all required variables

# Install and build
npm install
npm run build
```

## 🔄 Daily Operations

### Start Application
```bash
cd /var/www/DEM
pm2 start ecosystem.config.cjs
pm2 save
```

### Restart Application
```bash
pm2 restart dialexportmart
```

### Stop Application
```bash
pm2 stop dialexportmart
```

### View Logs
```bash
pm2 logs dialexportmart
pm2 logs dialexportmart --lines 100
pm2 logs dialexportmart --err  # Only errors
```

### Monitor Application
```bash
pm2 monit
pm2 status
```

## 🔄 Update/Deploy New Code

```bash
cd /var/www/DEM
git pull origin main
npm install
npm run build
pm2 restart dialexportmart
```

OR use deploy script:
```bash
cd /var/www/DEM
chmod +x deploy.sh
./deploy.sh
```

## 🌐 Nginx Commands

```bash
# Restart
sudo systemctl restart nginx

# Reload (no downtime)
sudo systemctl reload nginx

# Test configuration
sudo nginx -t

# View error logs
sudo tail -50 /var/log/nginx/error.log

# View access logs
sudo tail -50 /var/log/nginx/access.log
```

## 🔒 SSL Certificate

```bash
# Get new certificate
sudo certbot --nginx -d domain.com -d www.domain.com

# Renew certificate
sudo certbot renew

# Test renewal
sudo certbot renew --dry-run

# List certificates
sudo certbot certificates
```

## 🛡️ Security

```bash
# Check firewall
sudo ufw status

# Check fail2ban
sudo systemctl status fail2ban

# Check running processes
ps aux --sort=-%cpu | head -10

# Check network connections
sudo netstat -tulpn
```

## 📊 System Monitoring

```bash
# CPU and processes
top
htop  # if installed

# Memory
free -h

# Disk space
df -h

# System logs
sudo journalctl -xe | tail -50
```

## 🐛 Troubleshooting

### Application not responding
```bash
# Check if running
pm2 status

# Check logs
pm2 logs dialexportmart --err

# Restart
pm2 restart dialexportmart
```

### 502 Bad Gateway
```bash
# Check PM2
pm2 status

# Check if app is listening
sudo netstat -tulpn | grep 3000

# Check Nginx
sudo nginx -t
sudo tail -50 /var/log/nginx/error.log
```

### High CPU Usage
```bash
# Find high CPU processes
ps aux --sort=-%cpu | head -10

# Monitor with PM2
pm2 monit
```

### Port already in use
```bash
# Find process using port 3000
sudo lsof -i :3000

# Kill process
sudo kill -9 <PID>
```

## 📝 Important Files

```
/var/www/DEM/              # Project directory
/var/www/DEM/.env          # Environment variables
/etc/nginx/sites-available/domain.com  # Nginx config
/etc/nginx/sites-enabled/domain.com    # Nginx enabled site
/var/log/nginx/            # Nginx logs
~/.pm2/                    # PM2 logs and config
```

## 🔑 Environment Variables Template

```env
MONGODB_URI=mongodb://localhost:27017/dialexportmart
NEXTAUTH_URL=https://www.domain.com
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32
NODE_ENV=production
PORT=3000
```

## ⚠️ Emergency Commands

### Kill all Node processes
```bash
pkill -9 node
```

### Restart everything
```bash
pm2 restart all
sudo systemctl restart nginx
```

### Check if site is up
```bash
curl -I https://www.domain.com
```

### Full system restart
```bash
sudo reboot
```

---

**Tip:** Bookmark this file for quick access!

