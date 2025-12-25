# 🚀 Production Deployment Steps - VPS पर Live करने के लिए

## ⚠️ IMPORTANT: पहले पुरानी site को safely stop करें

### Step 1: VPS पर Login करें
```bash
ssh root@your-vps-ip
# या
ssh root@srv1202762
```

### Step 2: Current Running Process को Stop करें

```bash
# PM2 process को stop करें
pm2 stop dialexportmart

# या अगर PM2 में नहीं है, तो process को kill करें
# PID 996 है (top में दिख रहा है)
kill -9 996

# Verify करें कि process stop हो गया
pm2 status
# या
ps aux | grep next-server
```

### Step 3: Project Directory में जाएं

```bash
# अपने project folder में जाएं
cd /path/to/your/project
# Example: cd /var/www/dialexportmart
# या जहाँ भी आपका project है
```

### Step 4: Git Pull करें (नई Code लाएं)

```bash
# Git pull करें
git pull origin main
# या
git pull origin master

# अगर conflicts हैं, तो resolve करें
# अगर नहीं हैं, तो continue करें
```

### Step 5: Dependencies Install करें

```bash
# Production dependencies install करें
npm install --production

# या अगर सभी dependencies चाहिए
npm install
```

### Step 6: Environment Variables Check करें

```bash
# .env file check करें
cat .env

# Ensure ये variables हैं:
# MONGO_URL=your_mongodb_connection_string
# NEXT_PUBLIC_BASE_URL=https://www.dialexportmart.com
# NEXT_PUBLIC_API_BASE_URL=https://www.dialexportmart.com
# NODE_ENV=production
```

### Step 7: Build करें

```bash
# Production build करें
npm run build

# Build successful होने तक wait करें
# अगर errors आएं, तो fix करें
```

### Step 8: PM2 के साथ Start करें

```bash
# पहले पुरानी process को delete करें (अगर है)
pm2 delete dialexportmart

# नई optimized code के साथ start करें
pm2 start npm --name "dialexportmart" -- start

# PM2 configuration save करें
pm2 save

# PM2 को startup पर चलाने के लिए setup करें
pm2 startup
# Output में दिखने वाली command को run करें
```

### Step 9: Monitor करें

```bash
# Real-time monitoring
pm2 monit

# या status check करें
pm2 status

# Logs देखें
pm2 logs dialexportmart --lines 50

# CPU usage check करें
top
# या
htop
```

### Step 10: Verify करें

```bash
# Website check करें
curl http://localhost:3000

# या browser में
# https://www.dialexportmart.com
```

## 🔧 Alternative: Direct PM2 Restart (अगर code already deployed है)

```bash
# 1. Git pull
git pull

# 2. Dependencies update
npm install --production

# 3. Rebuild
npm run build

# 4. PM2 restart (zero downtime)
pm2 restart dialexportmart

# 5. Monitor
pm2 monit
```

## ⚠️ Safety Precautions

### 1. Backup लें (अगर possible हो)
```bash
# Database backup (अगर access है)
mongodump --uri="your_mongodb_uri" --out=/backup/$(date +%Y%m%d)

# Code backup
cp -r /path/to/project /path/to/backup/$(date +%Y%m%d)
```

### 2. Maintenance Mode (Optional)
```bash
# अगर चाहें तो maintenance page show करें
# या simply PM2 stop करें, deploy करें, फिर start करें
```

### 3. Rollback Plan
```bash
# अगर कुछ गलत हो, तो पुरानी code पर वापस जाएं
git checkout previous-commit-hash
npm install
npm run build
pm2 restart dialexportmart
```

## 📊 Expected Results After Deployment

### Before (पुरानी code):
- CPU: 84.8% (next-server)
- Site crashes after few hours
- High memory usage

### After (नई optimized code):
- CPU: <50% (normal load पर)
- Site stable for hours/days
- Memory: ~200-400MB
- Database connections: Max 10

## 🎯 Quick Deployment Script

```bash
#!/bin/bash
# deploy.sh - Quick deployment script

echo "🛑 Stopping old process..."
pm2 stop dialexportmart

echo "📥 Pulling latest code..."
git pull

echo "📦 Installing dependencies..."
npm install --production

echo "🔨 Building application..."
npm run build

echo "🚀 Starting application..."
pm2 restart dialexportmart

echo "✅ Deployment complete!"
echo "📊 Monitoring..."
pm2 monit
```

**Usage:**
```bash
chmod +x deploy.sh
./deploy.sh
```

## 🔍 Troubleshooting

### अगर Build Fail हो:
```bash
# Check errors
npm run build 2>&1 | tee build.log

# Common fixes:
# 1. Delete .next folder
rm -rf .next
npm run build

# 2. Clear node_modules
rm -rf node_modules
npm install
npm run build
```

### अगर PM2 Start नहीं हो रहा:
```bash
# Check logs
pm2 logs dialexportmart --err

# Check if port 3000 is free
netstat -tulpn | grep 3000

# Kill process on port 3000 if needed
lsof -ti:3000 | xargs kill -9
```

### अगर CPU अभी भी High है:
```bash
# Check which process is using CPU
top

# Check PM2 logs
pm2 logs dialexportmart --lines 100

# Check database connections
# MongoDB में: db.serverStatus().connections
```

## 📝 Post-Deployment Checklist

- [ ] Website accessible है
- [ ] CPU usage <50% है
- [ ] PM2 status "online" है
- [ ] No errors in logs
- [ ] Database connections stable हैं
- [ ] Pages load properly हैं

---

**Deployment Date**: $(date)
**Status**: Ready for Production
**Estimated Downtime**: 2-5 minutes







