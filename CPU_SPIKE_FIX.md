# 🔧 CPU Spike Fix - Complete Solution

## Problem
Site crashes due to CPU spikes when:
- Traffic arrives (bots/users, Google crawlers)
- Next.js SSR pages load (server generates pages on every request)
- PM2 runs only 1 process (not utilizing multi-core CPU)

## ✅ Solutions Implemented

### 1. PM2 Cluster Mode (Multi-Core CPU Utilization)
**File:** `ecosystem.config.cjs`

**Changes:**
- Changed from `instances: 1` (single process) to `instances: 4` (multiple processes)
- Changed from `exec_mode: "fork"` to `exec_mode: "cluster"`
- Now PM2 will distribute requests across 4 processes, utilizing multiple CPU cores

**Why this helps:**
- Load is distributed across multiple processes
- Each process handles fewer requests
- Better CPU utilization (uses all 8 cores instead of just 1)
- Reduces CPU spikes per process

### 2. Removed Deprecated Next.js Config
**File:** `next.config.js`

**Changes:**
- Removed `experimental.instrumentationHook` (deprecated in Next.js 15)
- This eliminates the warning and potential issues

### 3. Added ISR/Caching to API Routes
**Files:**
- `src/app/api/manufacturers/[productslug]/route.js`
- `src/app/api/category/route.js`
- `src/app/api/category-products/route.js`

**Changes:**
- Added `Cache-Control` headers to API responses
- Cache duration: 1 hour (3600 seconds)
- Stale-while-revalidate: 2 hours (7200 seconds)

**Why this helps:**
- API responses are cached, reducing database queries
- Same API requests don't hit the database again for 1 hour
- Reduces CPU usage from database queries
- Pages already have ISR (revalidate: 3600), now API routes are also cached

## 📊 Expected Results

### Before:
- ❌ Single PM2 process (1 CPU core)
- ❌ Every request hits database
- ❌ CPU spikes to 90-100% when traffic arrives
- ❌ Site crashes

### After:
- ✅ 4 PM2 processes (multiple CPU cores)
- ✅ API responses cached for 1 hour
- ✅ Load distributed across processes
- ✅ CPU usage more stable
- ✅ Site handles traffic spikes better

## 🚀 Deployment Steps

### 1. On VPS, stop current PM2 process:
```bash
pm2 stop dialexportmart
pm2 delete dialexportmart
```

### 2. Pull latest code:
```bash
cd /var/www/DEM
git pull origin main
```

### 3. Rebuild (if needed):
```bash
npm run build
```

### 4. Start with new PM2 config:
```bash
pm2 start ecosystem.config.cjs
pm2 save
```

### 5. Check status:
```bash
pm2 status
pm2 monit  # Monitor CPU usage
```

## 📝 Important Notes

1. **Instance Count**: Currently set to 4 instances. Adjust based on your CPU cores:
   - 4 cores: use 3 instances
   - 8 cores: use 4-6 instances (current: 4)
   - More instances = better load distribution but more memory usage

2. **Memory Usage**: With 4 instances, memory usage will increase (each process uses ~50-100MB). Monitor with `pm2 monit`

3. **Caching**: API routes are cached for 1 hour. If you update products/categories, changes may take up to 1 hour to reflect (or restart PM2 to clear cache)

4. **ISR on Pages**: Pages already have ISR (revalidate: 3600), so they regenerate every hour. Combined with API caching, this significantly reduces CPU load.

## 🔍 Monitoring

After deployment, monitor:
```bash
# Check process status
pm2 status

# Real-time monitoring
pm2 monit

# Check logs
pm2 logs dialexportmart --lines 50

# Check CPU usage (should be distributed across processes)
htop
```

## ✅ Success Indicators

- ✅ `pm2 status` shows 4 processes running
- ✅ CPU usage is distributed (not 100% on single process)
- ✅ Site handles traffic without crashing
- ✅ API responses are cached (check response headers)
- ✅ No more CPU spikes to 90-100%

## 🆘 If Issues Occur

1. **Too many instances causing memory issues:**
   - Reduce `instances: 4` to `instances: 2` in `ecosystem.config.cjs`
   - Restart: `pm2 restart dialexportmart`

2. **Still seeing CPU spikes:**
   - Check if caching is working (inspect API response headers)
   - Verify pages have ISR (check for `revalidate` export)
   - Monitor with `pm2 monit` to see which process is spiking

3. **Site not starting:**
   - Check logs: `pm2 logs dialexportmart --lines 50`
   - Verify Next.js build: `npm run build`
   - Check if port 3000 is available

