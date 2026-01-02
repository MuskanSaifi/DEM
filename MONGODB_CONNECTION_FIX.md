# 🔧 MongoDB Connection Fix - CPU Spike Root Cause

## ❌ Root Cause Identified

**The real issue is NOT CPU processing - it's MongoDB connection timeouts!**

### Problem:
- MongoDB connection timeout: 10 seconds (too short)
- Cluster mode with 4 processes = 4 separate MongoDB connection pools
- All processes trying to connect simultaneously → connection failures
- Failed connections → process crashes → high restart counts
- CPU spikes caused by connection retries and process restarts

### Error Pattern:
```
MongoServerSelectionError: Socket 'secureConnect' timed out after 10000ms
MongoNetworkTimeoutError: Socket 'secureConnect' timed out
```

## ✅ Fixes Applied

### 1. Increased MongoDB Connection Timeouts
**File:** `src/lib/dbConnect.js`

**Changes:**
- `connectTimeoutMS`: 10000 → **30000** (30 seconds)
- `serverSelectionTimeoutMS`: 5000 → **30000** (30 seconds)
- Added `retryWrites: true`
- Added `retryReads: true`

**Why:**
- Network latency to MongoDB can be high
- 10 seconds is too short for secure connections
- 30 seconds gives enough time for connection establishment

### 2. Changed PM2 to Fork Mode (Single Instance)
**File:** `ecosystem.config.cjs`

**Changes:**
- `instances`: 4 → **1**
- `exec_mode`: "cluster" → **"fork"**

**Why:**
- MongoDB connection is the bottleneck, NOT CPU processing
- Single process = single connection pool (more stable)
- Fork mode is more reliable for MongoDB connections
- Cluster mode creates multiple connection pools (connection exhaustion)

## 📊 Why This Fixes the CPU Spike

### Before:
1. 4 processes start simultaneously
2. Each tries to connect to MongoDB
3. Connection timeout (10 seconds) → fails
4. Processes crash and restart
5. Restart loop → CPU spikes to 100%
6. Site crashes

### After:
1. 1 process starts
2. Single MongoDB connection with longer timeout (30 seconds)
3. Connection succeeds (more time to establish)
4. Process runs stable
5. No restart loop
6. CPU usage normal

## 🚀 Deployment Steps

### On VPS, run these commands:

```bash
cd /var/www/DEM

# 1. Pull latest code (with fixes)
git pull origin main

# 2. Stop old PM2 processes
pm2 stop dialexportmart
pm2 delete dialexportmart

# 3. Start with new config (fork mode, single instance)
pm2 start ecosystem.config.cjs
pm2 save

# 4. Check status (should show 1 process, 0 restarts)
pm2 status

# 5. Check logs (should see MongoDB connection success)
pm2 logs dialexportmart --lines 30
```

## ✅ Expected Results

### PM2 Status:
```
┌─────┬──────────────────┬─────────────┬─────────┬─────────┬──────────┐
│ id  │ name             │ mode        │ ↺       │ status  │ cpu      │
├─────┼──────────────────┼─────────────┼─────────┼─────────┼──────────┤
│ 0   │ dialexportmart   │ fork        │ 0       │ online  │ 0%       │
└─────┴──────────────────┴─────────────┴─────────┴─────────┴──────────┘
```

### Logs Should Show:
```
✅ MongoDB connected successfully
✅ Global error handlers initialized
```

### CPU Usage:
- Should stay below 50% under normal load
- No more spikes to 100%
- Stable performance

## 🔍 Monitoring

### Check MongoDB Connection:
```bash
pm2 logs dialexportmart | grep -i "mongodb"
```

Should see:
- `✅ MongoDB connected successfully`
- NO `MongoServerSelectionError`
- NO `MongoNetworkTimeoutError`

### Check Process Stability:
```bash
pm2 status
pm2 monit
```

Should see:
- 1 process (fork mode)
- 0 restarts (stable)
- Normal CPU usage

## 📝 Important Notes

1. **Single Process is OK**: 
   - MongoDB connection is the bottleneck, not CPU
   - ISR and API caching handle traffic spikes
   - Single process is more stable than cluster mode for MongoDB

2. **Connection Timeout**: 
   - 30 seconds is standard for cloud MongoDB (Atlas, etc.)
   - Adjust if your MongoDB is local (can use 10s)

3. **If Still Getting Timeouts**:
   - Check MongoDB server status
   - Verify MONGO_URL in .env
   - Check network connectivity
   - Check MongoDB connection limits

4. **Future Optimization**:
   - Once stable, can try cluster mode with 2 instances
   - But fork mode is recommended for MongoDB connections

## 🆘 Troubleshooting

### If Still Getting Connection Errors:

1. **Check MongoDB URL**:
   ```bash
   # Verify .env file
   cat .env | grep MONGO_URL
   ```

2. **Test MongoDB Connection**:
   ```bash
   # Try connecting directly (if mongosh is installed)
   mongosh "your-mongo-url"
   ```

3. **Check MongoDB Server**:
   - Is MongoDB Atlas/server running?
   - Check MongoDB dashboard/logs
   - Verify IP whitelist (if using Atlas)

4. **Network Issues**:
   ```bash
   # Test network connectivity
   ping your-mongodb-host
   ```

## 🎯 Success Criteria

✅ Single PM2 process running (fork mode)
✅ 0 restarts (stable)
✅ MongoDB connection successful (check logs)
✅ No connection timeout errors
✅ CPU usage normal (< 50%)
✅ Site accessible and stable

