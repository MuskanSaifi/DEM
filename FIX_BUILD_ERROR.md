# 🔧 Build Error Fix - tailwindcss Missing

## ❌ Problem
```
Error: Cannot find module 'tailwindcss'
```

## 🔍 Root Cause
`npm install --production` करने से **devDependencies** install नहीं होतीं, और `tailwindcss` devDependencies में है।

## ✅ Solution

### Option 1: All Dependencies Install करें (Recommended)
```bash
# Production में भी devDependencies चाहिए (build के लिए)
npm install
```

### Option 2: Only Missing Package Install करें
```bash
npm install tailwindcss postcss autoprefixer --save-dev
```

---

## 🚀 Corrected Deployment Commands

```bash
# 1. Project directory में जाएं
cd /var/www/DEM

# 2. Cleanup
rm -rf .next
rm -rf node_modules

# 3. Git pull
git pull origin main

# 4. ✅ ALL dependencies install करें (--production नहीं)
npm install

# 5. Build
npm run build

# 6. PM2 start
pm2 delete dialexportmart
pm2 start npm --name "dialexportmart" -- start
pm2 save
pm2 status
```

---

## 📝 Updated One-Line Command

```bash
cd /var/www/DEM && rm -rf .next node_modules && git pull origin main && npm install && npm run build && pm2 delete dialexportmart && pm2 start npm --name "dialexportmart" -- start && pm2 save && pm2 status
```

---

## ⚠️ Important Note

**Production में भी devDependencies चाहिए** क्योंकि:
- `tailwindcss` - Build time पर CSS generate करने के लिए
- `postcss` - CSS processing के लिए
- `eslint` - Code quality check के लिए (optional)

**Memory Impact**: Minimal - devDependencies build time पर ही use होती हैं, runtime पर नहीं।

---

## ✅ After Fix

Build successful होने पर:
- ✅ No "Cannot find module" errors
- ✅ `.next` folder properly generated
- ✅ Application ready to start

---

**Fix Applied**: Use `npm install` instead of `npm install --production`







