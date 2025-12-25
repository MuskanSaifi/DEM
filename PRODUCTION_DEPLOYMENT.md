# Production Deployment Guide - Dial Export Mart

## 🚀 VPS KVM 4 Deployment Steps

### Prerequisites
- Node.js 18+ installed
- PM2 installed globally
- MongoDB connection string ready
- Environment variables configured

### 1. Build the Application

```bash
npm install
npm run build
```

### 2. Environment Variables (.env)

Create `.env` file in root directory:

```env
MONGO_URL=your_mongodb_connection_string
NEXT_PUBLIC_BASE_URL=https://www.dialexportmart.com
NEXT_PUBLIC_API_BASE_URL=https://www.dialexportmart.com
NODE_ENV=production
```

### 3. Install PM2 (Process Manager)

```bash
npm install -g pm2
```

### 4. Start Application with PM2

```bash
# Start the application
pm2 start npm --name "dialexportmart" -- start

# Save PM2 configuration
pm2 save

# Setup PM2 to start on system reboot
pm2 startup
# Follow the instructions shown in terminal
```

### 5. Monitor Application

```bash
# View logs
pm2 logs dialexportmart

# Monitor CPU/Memory usage
pm2 monit

# Check status
pm2 status
```

### 6. Nginx Configuration (Optional but Recommended)

Create `/etc/nginx/sites-available/dialexportmart`:

```nginx
server {
    listen 80;
    server_name www.dialexportmart.com dialexportmart.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/dialexportmart /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 7. SSL Certificate (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d www.dialexportmart.com -d dialexportmart.com
```

## 🔧 Performance Optimizations Applied

### ✅ Database Connection Pooling
- Connection reuse implemented
- Max pool size: 10 connections
- Prevents connection exhaustion

### ✅ Query Optimizations
- All product queries have pagination (max 100 per request)
- Limited products per subcategory (10 max)
- Used `.lean()` for faster queries
- Added indexes recommendations

### ✅ Caching
- API routes have 5-minute cache
- ISR (Incremental Static Regeneration) enabled
- Pages revalidate every hour

### ✅ Build Optimizations
- SWC minification enabled
- Console logs removed in production
- Standalone output for better deployment

## 📊 Data Size Analysis

Your current data:
- **3,000 Products** ✅ Manageable
- **3,000 Users** ✅ Manageable  
- **15 Categories** ✅ Very small
- **100+ Subcategories** ✅ Small

**Conclusion**: Data size is NOT the issue. The CPU spike was caused by:
1. ❌ Fetching ALL products without pagination
2. ❌ Individual database queries in loops
3. ❌ Missing connection pooling
4. ❌ No query limits

All these issues are now **FIXED** ✅

## 🎯 Monitoring Commands

```bash
# Check CPU usage
top
# or
htop

# Check PM2 processes
pm2 list

# Check MongoDB connections
# Connect to MongoDB and run:
db.serverStatus().connections

# Check application logs
pm2 logs dialexportmart --lines 100

# Restart application
pm2 restart dialexportmart

# Stop application
pm2 stop dialexportmart
```

## 🚨 Troubleshooting

### High CPU Usage
1. Check PM2 logs: `pm2 logs dialexportmart`
2. Monitor processes: `pm2 monit`
3. Check MongoDB connections
4. Restart if needed: `pm2 restart dialexportmart`

### Application Crashes
1. Check logs: `pm2 logs dialexportmart --err`
2. Check memory: `free -h`
3. Increase PM2 memory limit if needed

### Database Connection Issues
1. Verify MONGO_URL in .env
2. Check MongoDB server status
3. Verify network connectivity

## 📈 Expected Performance

After optimizations:
- **CPU Usage**: Should stay below 50% under normal load
- **Memory Usage**: ~200-400MB per instance
- **Response Time**: <500ms for most pages
- **Database Connections**: Max 10 concurrent

## 🔄 Updates & Maintenance

```bash
# Pull latest code
git pull

# Install dependencies
npm install

# Rebuild
npm run build

# Restart PM2
pm2 restart dialexportmart
```

## 📝 Important Notes

1. **Never** fetch all products without pagination
2. **Always** use `.lean()` for read-only queries
3. **Limit** populate queries (max 10-20 items)
4. **Cache** frequently accessed data
5. **Monitor** CPU and memory regularly

---

**Deployment Date**: $(date)
**Optimized By**: AI Assistant
**Status**: ✅ Production Ready







