# 🔧 Next.js Standalone Mode Fix

## ❌ Issue Found in Logs

**Warning:**
```
⚠ "next start" does not work with "output: standalone" configuration. 
Use "node .next/standalone/server.js" instead.
```

## ✅ Fixes Applied

### 1. PM2 Config Updated for Standalone Mode
**File:** `ecosystem.config.cjs`

**Before:**
```javascript
script: "npm",
args: "start",
```

**After:**
```javascript
script: "node",
args: ".next/standalone/server.js",
```

**Why:**
- Next.js standalone mode creates a self-contained server in `.next/standalone/`
- `next start` doesn't work with standalone builds
- Must use `node .next/standalone/server.js` directly

### 2. Images Config Deprecation Fix
**File:** `next.config.js`

**Before:**
```javascript
images: {
  domains: ["res.cloudinary.com", "randomuser.me"],
},
```

**After:**
```javascript
images: {
  remotePatterns: [
    {
      protocol: "https",
      hostname: "res.cloudinary.com",
    },
    {
      protocol: "https",
      hostname: "randomuser.me",
    },
  ],
},
```

**Why:**
- `images.domains` is deprecated in Next.js 15
- `remotePatterns` is the new recommended approach
- More flexible and secure

## 🚀 Deployment Steps

### On VPS:

```bash
cd /var/www/DEM

# 1. Pull latest code
git pull origin main

# 2. Rebuild (IMPORTANT - standalone build needed)
npm run build

# 3. Stop old process
pm2 stop dialexportmart
pm2 delete dialexportmart

# 4. Start with new config (uses standalone server)
pm2 start ecosystem.config.cjs
pm2 save

# 5. Check status
pm2 status

# 6. Check logs (should NOT show standalone warning)
pm2 logs dialexportmart --lines 30
```

## ✅ Expected Results

### Logs Should Show:
- ✅ No standalone warning
- ✅ No images.domains deprecation warning
- ✅ Application started successfully
- ✅ MongoDB connection successful

### PM2 Status:
- ✅ Process online
- ✅ 0 restarts
- ✅ Normal CPU/memory usage

## 📝 Important Notes

1. **Rebuild Required**: 
   - After changing `next.config.js`, MUST rebuild
   - `npm run build` creates `.next/standalone/` folder
   - Without rebuild, standalone server won't exist

2. **Standalone Mode Benefits**:
   - Smaller deployment size
   - Faster startup
   - Self-contained (doesn't need all node_modules)
   - Better for VPS deployment

3. **File Structure**:
   After build, you should have:
   ```
   .next/
     standalone/
       server.js  ← This is what PM2 runs now
   ```

## 🔍 Verification

### Check if Standalone Server Exists:
```bash
ls -la .next/standalone/server.js
```

Should exist after build.

### Check Logs for Warnings:
```bash
pm2 logs dialexportmart | grep -i "warning\|deprecated"
```

Should be empty (no warnings).

### Check Application Running:
```bash
curl http://localhost:3000
# or visit your domain
```

Should respond normally.

## 🆘 Troubleshooting

### If Standalone Server Not Found:
```bash
# Rebuild
npm run build

# Check if standalone folder exists
ls -la .next/standalone/

# If still not there, check build logs
npm run build 2>&1 | tail -50
```

### If PM2 Fails to Start:
```bash
# Check if server.js exists
test -f .next/standalone/server.js && echo "Exists" || echo "Not found"

# Try running manually
node .next/standalone/server.js

# Check for errors
```

### If Port Already in Use:
```bash
# Check what's using port 3000
lsof -i :3000
# or
netstat -tulpn | grep 3000

# Kill if needed
pm2 delete dialexportmart
# or
kill -9 <PID>
```

