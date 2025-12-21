# 🚀 VPS Deployment Commands - Step by Step

## 📍 VPS पर ये Commands Run करें

### Step 1: Project Directory में जाएं
```bash
cd /var/www/DEM
```

### Step 2: पुरानी Files Delete करें
```bash
# .next folder delete करें
rm -rf .next

# node_modules delete करें
rm -rf node_modules
```

### Step 3: Git Pull करें
```bash
git pull origin main
```

### Step 4: Dependencies Install करें
```bash
npm install --production
```

### Step 5: Build करें
```bash
npm run build
```

### Step 6: PM2 के साथ Start करें
```bash
# पुरानी process delete करें (अगर है)
pm2 delete dialexportmart

# नई code के साथ start करें
pm2 start npm --name "dialexportmart" -- start

# PM2 save करें
pm2 save
```

### Step 7: Monitor करें
```bash
# Status check करें
pm2 status

# Real-time monitoring
pm2 monit

# Logs देखें
pm2 logs dialexportmart --lines 50
```

---

## 🔥 Complete One-Line Commands (Copy-Paste Ready)

```bash
# Complete deployment in one go
cd /var/www/DEM && rm -rf .next node_modules && git pull origin main && npm install --production && npm run build && pm2 delete dialexportmart && pm2 start npm --name "dialexportmart" -- start && pm2 save && pm2 status
```

---

## 📝 Step-by-Step (Recommended)

```bash
# 1. Directory में जाएं
cd /var/www/DEM

# 2. Cleanup
rm -rf .next
rm -rf node_modules

# 3. Git pull
git pull origin main

# 4. Install dependencies
npm install --production

# 5. Build
npm run build

# 6. Stop old process (if running)
pm2 stop dialexportmart
pm2 delete dialexportmart

# 7. Start new process
pm2 start npm --name "dialexportmart" -- start

# 8. Save PM2 config
pm2 save

# 9. Check status
pm2 status

# 10. Monitor
pm2 monit
```

---

## ⚠️ अगर Build में Error आए

```bash
# .env file check करें
cat .env

# Environment variables verify करें
echo $MONGO_URL
echo $NODE_ENV

# अगर .env missing है, तो create करें
nano .env
# या
vi .env
```

---

## 🔍 Troubleshooting

### अगर Port Busy हो:
```bash
# Port 3000 check करें
lsof -ti:3000

# Kill करें
lsof -ti:3000 | xargs kill -9
```

### अगर PM2 Start नहीं हो रहा:
```bash
# PM2 kill करें
pm2 kill

# फिर start करें
pm2 start npm --name "dialexportmart" -- start
```

### CPU Usage Check:
```bash
# Real-time CPU check
top

# या
htop
```

---

## ✅ Success Indicators

Deployment successful होने पर:
- ✅ `pm2 status` में `dialexportmart` **online** दिखेगा
- ✅ CPU usage **<50%** होगा
- ✅ Website **accessible** होगी
- ✅ Logs में **no errors** होंगे

---

**Ready to Deploy!** 🚀






