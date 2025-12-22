# ⚡ Quick Deploy - Site Down Fix

## 🚀 VPS Par Ye Commands Run Karein (5 Minutes)

```bash
# 1. Project directory mein jao
cd /var/www/DEM  # ya apna path

# 2. Code pull karo
git pull origin main

# 3. Dependencies install karo
npm install

# 4. Build karo
npm run build

# 5. Logs folder create karo
mkdir -p logs

# 6. Purani process delete karo
pm2 delete dialexportmart

# 7. Naye config se start karo (IMPORTANT!)
pm2 start ecosystem.config.cjs

# 8. PM2 save karo
pm2 save

# 9. Status check karo
pm2 status
```

## ✅ Kya Fix Hua?

1. **Auto-Restart**: Agar server crash ho, automatically restart hoga
2. **Memory Limit**: 800MB se zyada memory use hone par restart hoga
3. **Error Handling**: Sab errors properly handle honge
4. **Database Reconnection**: Database disconnect hone par auto-reconnect hoga
5. **CPU Stability**: CPU usage 100% tak nahi jayega

## 🔍 Monitor Karein

```bash
# Real-time monitoring
pm2 monit

# Logs dekho
pm2 logs dialexportmart

# Memory usage
pm2 show dialexportmart
```

## 📝 Important

- ✅ PM2 ab automatically restart karega
- ✅ Memory issues automatically handle honge
- ✅ Database connection stable rahega
- ✅ Site permanently up rahegi
- ✅ CPU usage stable rahega

---

**Agar koi issue ho to**: `pm2 logs dialexportmart` check karo

