# ⚡ Quick Go-Live Steps (5 Minutes)

## 🚀 Fast Track - Get Website Live Again

### STEP 1: Change MongoDB Password (2 minutes)

**MongoDB Atlas:**
1. Login: https://cloud.mongodb.com
2. Database Access → Edit User → Edit Password
3. New password: `YourNewSecurePassword123!@#`
4. Save password securely

**Self-Hosted:**
```bash
mongosh
use admin
db.changeUserPassword("username", "YourNewSecurePassword123!@#")
```

### STEP 2: Update .env File (1 minute)

```bash
# Edit .env
nano .env

# Update MONGODB_URI with new password (URL encode special chars)
# @ → %40, # → %23, $ → %24, etc.

# Save: Ctrl+X, Y, Enter
```

**Example:**
```
# Old:
MONGODB_URI=mongodb://user:oldpass@cluster.net/db

# New:
MONGODB_URI=mongodb://user:YourNewSecurePassword123%21%40%23@cluster.net/db
```

### STEP 3: Rebuild & Restart (2 minutes)

```bash
# Build
npm run build

# Restart
pm2 restart dialexportmart

# Verify
pm2 logs dialexportmart --lines 20
```

### STEP 4: Test Website

1. Visit: `https://www.dialexportmart.com`
2. Check homepage loads
3. Check product pages
4. No redirects = ✅ Success!

---

## ✅ Done! Website is Live!

**Next:**
- Google Search Console cleanup (optional - can do later)
- Monitor for 24-48 hours
- Check for new malicious content daily
