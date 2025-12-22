# 🚀 VPS Par Clean Deploy - Step by Step

## 📍 VPS Terminal Mein Ye Commands Run Karein

### Step 1: Project Directory Mein Jao
```bash
cd /var/www/DEM
```

### Step 2: Purane Build Aur Node Modules Delete Karein
```bash
# Purane build folder delete karo
rm -rf .next

# Purane node_modules delete karo
rm -rf node_modules
```

### Step 3: Git Pull Karein (Nayi Code)
```bash
git pull origin main
```

### Step 4: Dependencies Install Karein
```bash
npm install
```

### Step 5: Build Karein
```bash
npm run build
```

### Step 6: Logs Folder Create Karein (Agar Nahi Hai)
```bash
mkdir -p logs
```

### Step 7: PM2 Process Stop Karein
```bash
pm2 stop dialexportmart
```

### Step 8: Purani PM2 Process Delete Karein
```bash
pm2 delete dialexportmart
```

### Step 9: Naye Config Se Start Karein (IMPORTANT!)
```bash
pm2 start ecosystem.config.cjs
```

### Step 10: PM2 Save Karein
```bash
pm2 save
```

### Step 11: Status Check Karein
```bash
pm2 status
```

### Step 12: Logs Check Karein
```bash
pm2 logs dialexportmart --lines 20
```

---

## 🔥 Complete One-Line Command (Copy-Paste Ready)

```bash
cd /var/www/DEM && rm -rf .next node_modules && git fetch origin && git reset --hard origin/main && npm install && npm run build && mkdir -p logs && pm2 stop dialexportmart && pm2 delete dialexportmart && pm2 start ecosystem.config.cjs && pm2 save && pm2 status
```

---

## ✅ Verification Commands

### PM2 Status Check
```bash
pm2 status
```
**Expected Output:**
- Status: `online` (green)
- CPU: Low percentage
- Memory: Around 50-100MB

### Logs Check
```bash
pm2 logs dialexportmart --lines 30
```
**Expected Output:**
- Should show "✅ Global error handlers initialized"
- Should show "✅ MongoDB connected successfully"
- No errors

### Real-time Monitoring
```bash
pm2 monit
```
**Expected Output:**
- CPU usage stable (not 100%)
- Memory usage stable
- Process running smoothly

---

## 🚨 Agar Koi Error Aaye

### Build Error
```bash
# Check .env file
cat .env

# Check Node version
node -v
# Should be 18+ or 20+

# Try again
npm install
npm run build
```

### PM2 Error
```bash
# Check if PM2 is installed
pm2 --version

# If not installed
npm install -g pm2

# Check ecosystem.config.js exists
ls -la ecosystem.config.js
```

### Git Pull Error
```bash
# Check git status
git status

# If conflicts, resolve them
git stash
git pull origin main
git stash pop
```

---

## 📝 Important Notes

1. **ecosystem.config.cjs Use Karein**: 
   - ✅ `pm2 start ecosystem.config.cjs` (Correct - .cjs extension zaroori hai)
   - ❌ `pm2 start ecosystem.config.js` (Error dega - ES module issue)
   - ❌ `pm2 start npm --name "dialexportmart" -- start` (Old way)

2. **Auto-Restart**: 
   - PM2 ab automatically restart karega agar crash ho
   - Memory 800MB se zyada ho to restart hoga

3. **Error Logs**: 
   - Sab errors `logs/pm2-error.log` mein save honge

4. **Database Connection**: 
   - Auto-reconnect hoga agar disconnect ho

---

## 🎯 Success Indicators

Agar sab kuch sahi hai, to:
- ✅ `pm2 status` mein "online" dikhega
- ✅ Logs mein "✅ Global error handlers initialized" dikhega
- ✅ Logs mein "✅ MongoDB connected successfully" dikhega
- ✅ Site accessible hoga
- ✅ CPU usage stable rahega

---

**Agar koi issue ho to**: `pm2 logs dialexportmart --lines 50` check karein

