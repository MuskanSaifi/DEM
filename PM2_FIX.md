# 🔧 PM2 Error Fix - ERR_REQUIRE_ESM

## ❌ Problem
```
Error [ERR_REQUIRE_ESM]: require() of ES Module /var/www/DEM/ecosystem.config.js not supported
```

## ✅ Solution

`package.json` mein `"type": "module"` hai, isliye PM2 ES module load nahi kar pa raha.

**Fix**: `ecosystem.config.js` ko `ecosystem.config.cjs` rename karo.

## 🚀 VPS Par Commands

```bash
# Step 1: Purani file delete karo (agar hai)
rm -f ecosystem.config.js

# Step 2: Nayi .cjs file use karo
pm2 start ecosystem.config.cjs

# Step 3: PM2 save karo
pm2 save

# Step 4: Status check karo
pm2 status
```

## 📝 Complete Deploy Commands

```bash
cd /var/www/DEM && rm -rf .next node_modules && git fetch origin && git reset --hard origin/main && npm install && npm run build && mkdir -p logs && pm2 stop dialexportmart && pm2 delete dialexportmart && pm2 start ecosystem.config.cjs && pm2 save && pm2 status
```

---

**Note**: Ab `ecosystem.config.cjs` use karein, `.js` nahi!

