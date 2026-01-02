# 🔧 Environment Variables Fix - MongoDB Connection Issue

## ❌ Problem

**Error in logs:**
```
MongooseError: The "uri" parameter to openUri() must be a string, got "undefined"
Database connection failed: The uri parameter to openUri() must be a string
```

**Root Cause:**
- Next.js standalone mode with direct `node .next/standalone/server.js` execution
- Environment variables from `.env` file not loading automatically
- `MONGO_URL` is `undefined` → MongoDB connection fails
- Website shows no data because backend can't connect to database

## ✅ Solution

**Changed PM2 config to use `npm start` instead of direct node execution**

### Why This Works:
- `npm start` runs `next start` which automatically loads `.env` file
- Next.js handles environment variables properly
- Works with standalone mode (Next.js internally uses standalone server)
- No need to manually pass environment variables

### Changes:
**File:** `ecosystem.config.cjs`

**Before:**
```javascript
script: "node",
args: ".next/standalone/server.js",
```

**After:**
```javascript
script: "npm",
args: "start",
```

## 🚀 Deployment Steps

### On VPS:

```bash
cd /var/www/DEM

# 1. Pull latest code
git pull origin main

# 2. Verify .env file exists and has MONGO_URL
cat .env | grep MONGO_URL

# 3. Stop old process
pm2 stop dialexportmart
pm2 delete dialexportmart

# 4. Start with updated config (uses npm start)
pm2 start ecosystem.config.cjs
pm2 save

# 5. Check status
pm2 status

# 6. Check logs (should show MongoDB connection success)
pm2 logs dialexportmart --lines 30
```

## ✅ Expected Results

### Logs Should Show:
```
✅ MongoDB connected successfully
✅ Global error handlers initialized
✓ Ready in Xms
```

### No More Errors:
- ❌ NO `MongooseError: The "uri" parameter to openUri() must be a string`
- ❌ NO `Database connection failed: undefined`
- ✅ MongoDB connection established
- ✅ Website shows data correctly

### PM2 Status:
- ✅ Process online
- ✅ 0 restarts (stable)
- ✅ Normal CPU/memory usage

## 📝 Important Notes

1. **`.env` File Must Exist:**
   ```bash
   # Check if .env file exists
   ls -la .env
   
   # Verify MONGO_URL is set
   cat .env | grep MONGO_URL
   ```

2. **`.env` File Location:**
   - Must be in project root directory (`/var/www/DEM/.env`)
   - Next.js automatically loads it when using `npm start`

3. **Environment Variables:**
   - `MONGO_URL` - MongoDB connection string (REQUIRED)
   - `NEXT_PUBLIC_BASE_URL` - Website URL
   - `NEXT_PUBLIC_API_BASE_URL` - API URL
   - Any other variables your app needs

4. **Security:**
   - `.env` file should NOT be committed to git
   - Should be in `.gitignore`
   - Contains sensitive information (database passwords, API keys)

## 🔍 Verification

### Check MongoDB Connection:
```bash
pm2 logs dialexportmart | grep -i "mongodb"
```

Should see:
- ✅ `✅ MongoDB connected successfully`
- ❌ NO `undefined` errors

### Check Website:
- Visit your website
- Should show data (products, categories, etc.)
- No blank pages

### Check .env File:
```bash
# Verify .env exists
test -f .env && echo "✅ .env file exists" || echo "❌ .env file missing"

# Check MONGO_URL (without showing the value)
cat .env | grep -q MONGO_URL && echo "✅ MONGO_URL is set" || echo "❌ MONGO_URL missing"
```

## 🆘 Troubleshooting

### If Still Getting "undefined" Error:

1. **Check .env File Exists:**
   ```bash
   ls -la .env
   ```

2. **Check MONGO_URL Format:**
   ```bash
   # Should be like:
   # MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/dbname
   cat .env | grep MONGO_URL
   ```

3. **Restart PM2:**
   ```bash
   pm2 restart dialexportmart
   pm2 logs dialexportmart --lines 50
   ```

4. **Check Working Directory:**
   ```bash
   # PM2 should run from project root
   pm2 show dialexportmart | grep "exec cwd"
   # Should show: /var/www/DEM
   ```

### If .env File is Missing:

Create `.env` file in project root:
```bash
cd /var/www/DEM
nano .env
```

Add required variables:
```env
MONGO_URL=your_mongodb_connection_string_here
NEXT_PUBLIC_BASE_URL=https://www.dialexportmart.com
NEXT_PUBLIC_API_BASE_URL=https://www.dialexportmart.com
NODE_ENV=production
```

Save and restart PM2:
```bash
pm2 restart dialexportmart
```

## 🎯 Success Criteria

✅ No MongoDB connection errors in logs
✅ Website shows data correctly
✅ PM2 process stable (0 restarts)
✅ MongoDB connected successfully
✅ All APIs working

