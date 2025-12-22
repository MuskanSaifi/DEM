# 🔧 Site Down Issue - Permanent Solution

## ❌ Problem
- Website chalte chalte band ho jati hai
- CPU usage 100% tak ja raha hai
- Site automatically restart nahi hoti

## ✅ Root Causes

1. **No Auto-Restart**: PM2 properly configured nahi hai
2. **No Error Handling**: Unhandled errors se server crash ho jata hai
3. **Database Connection Issues**: Connection drop hone par reconnection nahi hota
4. **Memory Leaks**: Memory monitor nahi hai
5. **No Health Checks**: Server health check nahi hai

## ✅ Solutions Implemented

### 1. PM2 Ecosystem Configuration (`ecosystem.config.js`)
- ✅ Auto-restart enabled
- ✅ Memory limit: 800MB (restart if exceeded)
- ✅ Error logging
- ✅ Restart delay: 5 seconds
- ✅ Max restarts: 10 per minute

### 2. Global Error Handlers (`src/lib/errorHandler.js`)
- ✅ Uncaught exception handler
- ✅ Unhandled promise rejection handler
- ✅ Memory monitoring (every minute)
- ✅ Graceful shutdown handlers

### 3. Database Connection Improvements (`src/lib/dbConnect.js`)
- ✅ Connection health checks
- ✅ Auto-reconnection on disconnect
- ✅ Connection event handlers
- ✅ Better error handling

### 4. Next.js Instrumentation (`src/instrumentation.js`)
- ✅ Auto-loads error handlers on server start

## 🚀 VPS Par Deploy Kaise Karein

### Step 1: VPS par login karein
```bash
ssh root@your-vps-ip
cd /var/www/DEM  # ya apna project path
```

### Step 2: Code pull karein
```bash
git pull origin main
```

### Step 3: Dependencies install karein
```bash
npm install
```

### Step 4: Build karein
```bash
npm run build
```

### Step 5: Logs folder create karein
```bash
mkdir -p logs
```

### Step 6: PM2 se start karein (NEW WAY - IMPORTANT!)
```bash
# Purani process delete karein
pm2 delete dialexportmart

# Naye config se start karein (ecosystem.config.js use karega)
pm2 start ecosystem.config.js

# PM2 save karein
pm2 save

# Status check karein
pm2 status
```

### Step 7: Monitor karein
```bash
# Real-time monitoring
pm2 monit

# Logs dekho
pm2 logs dialexportmart

# Memory usage dekho
pm2 show dialexportmart
```

## 📊 PM2 Commands

```bash
# Status check
pm2 status

# Logs dekho
pm2 logs dialexportmart --lines 100

# Restart karein
pm2 restart dialexportmart

# Stop karein
pm2 stop dialexportmart

# Delete karein
pm2 delete dialexportmart

# Memory usage dekho
pm2 show dialexportmart

# Real-time monitoring
pm2 monit
```

## 🔍 Monitoring & Troubleshooting

### Memory Usage Check
```bash
pm2 show dialexportmart
# Look for "memory" field
```

### Error Logs Check
```bash
pm2 logs dialexportmart --err --lines 50
```

### CPU Usage Check
```bash
pm2 monit
# or
top
```

### Database Connection Check
```bash
# MongoDB connection status
pm2 logs dialexportmart | grep -i "mongodb\|database"
```

## ⚠️ Important Notes

1. **PM2 Auto-Restart**: Agar server crash ho, PM2 automatically restart karega
2. **Memory Limit**: Agar memory 800MB se zyada ho, PM2 restart karega
3. **Error Logging**: Sab errors `logs/pm2-error.log` mein save honge
4. **Database Reconnection**: Database disconnect hone par automatically reconnect hoga

## 🎯 Expected Results

- ✅ Server crash hone par automatically restart hoga
- ✅ Memory limit exceed hone par restart hoga
- ✅ Database connection issues automatically handle honge
- ✅ Sab errors properly log honge
- ✅ Site permanently up rahegi
- ✅ CPU usage stable rahega (100% tak nahi jayega)

## 🚨 Agar Phir Bhi Issue Ho

1. **Check PM2 Status**:
   ```bash
   pm2 status
   ```

2. **Check Logs**:
   ```bash
   pm2 logs dialexportmart --lines 100
   ```

3. **Check Memory**:
   ```bash
   free -h
   pm2 show dialexportmart
   ```

4. **Restart PM2**:
   ```bash
   pm2 restart dialexportmart
   ```

5. **Check Database**:
   ```bash
   # MongoDB connection string verify karein
   echo $MONGO_URL
   ```

## 📝 Files Created/Modified

1. ✅ `ecosystem.config.js` - PM2 configuration (NEW)
2. ✅ `src/lib/errorHandler.js` - Global error handlers (NEW)
3. ✅ `src/lib/dbConnect.js` - Improved database connection
4. ✅ `src/instrumentation.js` - Next.js instrumentation (NEW)
5. ✅ `next.config.js` - Instrumentation enabled

## ✅ Verification

Deployment ke baad verify karein:

```bash
# 1. PM2 status
pm2 status
# Should show "online" status

# 2. Check logs
pm2 logs dialexportmart --lines 20
# Should show "✅ Global error handlers initialized"
# Should show "✅ MongoDB connected successfully"

# 3. Monitor for 5 minutes
pm2 monit
# Memory aur CPU stable rahna chahiye

# 4. Test site
curl http://localhost:3000
# Should return HTML
```

## 🎉 Success!

Agar sab kuch sahi hai, to:
- ✅ Site permanently up rahegi
- ✅ Auto-restart hoga agar crash ho
- ✅ Memory issues automatically handle honge
- ✅ Database connection stable rahega
- ✅ CPU usage 100% tak nahi jayega

---

**Note**: Agar koi issue ho, to `pm2 logs dialexportmart` check karein aur error messages share karein.

