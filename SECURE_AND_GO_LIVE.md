# 🔒 Secure Database & Go Live - Complete Guide

## 📋 Checklist:
- [x] Database cleanup (44 malicious products deleted)
- [ ] Change MongoDB password
- [ ] Update connection strings
- [ ] Rebuild application
- [ ] Restart services
- [ ] Verify website
- [ ] Google Search Console cleanup
- [ ] Monitor for 24-48 hours

---

## 🔐 STEP 1: Change MongoDB Password

### Option A: MongoDB Atlas (Cloud Database)

1. **Login to MongoDB Atlas:**
   - Go to: https://cloud.mongodb.com
   - Login with your credentials

2. **Navigate to Database Access:**
   - Click **"Database Access"** in left sidebar
   - Find your database user
   - Click **"Edit"** button

3. **Change Password:**
   - Click **"Edit Password"**
   - Enter **new strong password** (minimum 12 characters, mix of uppercase, lowercase, numbers, special characters)
   - Example: `MyS3cur3P@ssw0rd2024!`
   - Click **"Update User"**

4. **Note New Password:**
   - Save password securely (password manager recommended)
   - You'll need it in next step

### Option B: Self-Hosted MongoDB (VPS)

```bash
# SSH into your server
ssh your-server

# Connect to MongoDB
mongosh

# Switch to admin database
use admin

# Change password for your user
db.changeUserPassword("your-username", "YourNewSecurePassword123!@#")

# Verify password change
db.auth("your-username", "YourNewSecurePassword123!@#")
# Should return: { ok: 1 }
```

---

## 🔄 STEP 2: Update Connection Strings

### Find Your .env File:

```bash
# On your server
cd /path/to/your/project
cat .env
```

### Update MongoDB Connection String:

**Old format:**
```
MONGODB_URI=mongodb://username:oldpassword@cluster.mongodb.net/database?retryWrites=true&w=majority
```

**New format (with new password):**
```
MONGODB_URI=mongodb://username:YourNewSecurePassword123!@#@cluster.mongodb.net/database?retryWrites=true&w=majority
```

**Important:** Special characters in password need URL encoding:
- `@` → `%40`
- `#` → `%23`
- `$` → `%24`
- `%` → `%25`
- `&` → `%26`
- `+` → `%2B`
- `=` → `%3D`
- `?` → `%3F`

**Example:**
```
# If password is: MyP@ss#123
# URL encoded: MyP%40ss%23123

MONGODB_URI=mongodb://username:MyP%40ss%23123@cluster.mongodb.net/database?retryWrites=true&w=majority
```

### Update .env File:

```bash
# Edit .env file
nano .env
# or
vi .env

# Update MONGODB_URI or MONGO_URI with new password
# Save and exit (Ctrl+X, then Y, then Enter for nano)
```

### Verify Connection String:

```bash
# Test connection (optional)
node -e "require('dotenv').config(); console.log(process.env.MONGODB_URI)"
```

---

## 🏗️ STEP 3: Rebuild Application

```bash
# Go to project directory
cd /path/to/your/project

# Pull latest code (if using git)
git pull origin main

# Install dependencies (if needed)
npm install

# Build application
npm run build

# Check for build errors
# If successful, proceed to next step
```

---

## 🚀 STEP 4: Restart Services

### Restart PM2:

```bash
# Stop current process
pm2 stop dialexportmart

# Delete old process
pm2 delete dialexportmart

# Start with new configuration
pm2 start ecosystem.config.cjs
# or
pm2 start npm --name "dialexportmart" -- start

# Save PM2 configuration
pm2 save

# Check status
pm2 status

# Check logs
pm2 logs dialexportmart --lines 50
```

### Restart Nginx (if needed):

```bash
# Test nginx configuration
sudo nginx -t

# If test passes, reload nginx
sudo systemctl reload nginx
# or
sudo service nginx reload
```

---

## ✅ STEP 5: Verify Website

### Check Application Status:

```bash
# Check PM2 status
pm2 status

# Check application logs
pm2 logs dialexportmart --lines 100

# Check for errors
pm2 logs dialexportmart --err --lines 50
```

### Test Website:

1. **Homepage:**
   - Visit: `https://www.dialexportmart.com`
   - Check if page loads correctly
   - No redirects to malicious sites

2. **Product Pages:**
   - Visit a product page
   - Check if content loads correctly
   - No malicious content visible

3. **API Endpoints:**
   - Test: `https://www.dialexportmart.com/api/products`
   - Should return products (no errors)

4. **Database Connection:**
   - Check PM2 logs for connection errors
   - Should see: "✅ Connected to MongoDB" or similar

---

## 🔍 STEP 6: Google Search Console Cleanup

### Request Removal of Malicious URLs:

1. **Go to Google Search Console:**
   - Visit: https://search.google.com/search-console
   - Select property: `dialexportmart.com`

2. **Request Removal:**
   - Go to **"Removals"** in left sidebar
   - Click **"New Request"**
   - Enter URL pattern: `dialexportmart.com/*`
   - Select: **"Temporarily hide from search results"**
   - Click **"Submit Request"**

3. **Submit Updated Sitemap:**
   - Go to **"Sitemaps"**
   - Submit: `https://www.dialexportmart.com/sitemap.xml`
   - Request re-indexing

4. **Monitor:**
   - Check **"Coverage"** report daily
   - Verify malicious URLs decreasing
   - Wait 24-48 hours for re-indexing

---

## 🔒 STEP 7: Additional Security Measures

### Change All Other Passwords:

1. **Server Root Password:**
   ```bash
   sudo passwd root
   ```

2. **SSH Keys (Recommended):**
   ```bash
   # Generate new SSH key
   ssh-keygen -t ed25519 -C "your-email@example.com"
   
   # Add to server
   ssh-copy-id user@your-server
   ```

3. **Cloudflare Password:**
   - Login to Cloudflare
   - Change account password
   - Enable 2FA

4. **Domain Registrar Password:**
   - Login to domain registrar
   - Change password
   - Enable 2FA

5. **All User Account Passwords:**
   - Admin accounts
   - User accounts
   - Support accounts

### Enable Two-Factor Authentication (2FA):

- ✅ Cloudflare account
- ✅ Domain registrar
- ✅ Server SSH access
- ✅ MongoDB Atlas (if using)
- ✅ All admin accounts

---

## 📊 STEP 8: Monitoring & Verification

### Daily Checks (First Week):

```bash
# Check for new malicious products
mongosh
use your-database-name
db.products.find({
  $or: [
    { name: /casino|gambling|bet|poker|slot|soccer.*betting|betting.*sites/i },
    { description: /casino|gambling|bet|poker|slot|soccer.*betting|betting.*sites/i }
  ]
}).count()
# Should return: 0
```

### Check Server Logs:

```bash
# Check nginx logs
sudo tail -f /var/log/nginx/access.log | grep -i "casino\|gambling\|betting"

# Check application logs
pm2 logs dialexportmart --lines 100 | grep -i "error\|malicious"
```

### Check Google Search Console:

- Daily check for new malicious URLs
- Monitor coverage report
- Check for security issues

---

## 🎯 Complete Go-Live Checklist:

### Pre-Launch:
- [x] Database cleanup completed (44 products deleted)
- [ ] MongoDB password changed
- [ ] .env file updated with new password
- [ ] Application rebuilt
- [ ] PM2 restarted
- [ ] Website tested (homepage, products, APIs)

### Post-Launch:
- [ ] Google Search Console removal requested
- [ ] Sitemap resubmitted
- [ ] All passwords changed
- [ ] 2FA enabled on all accounts
- [ ] Monitoring setup

### First Week:
- [ ] Daily database checks (no new malicious content)
- [ ] Daily Google Search Console checks
- [ ] Server logs monitoring
- [ ] Website performance check

---

## 🚨 Troubleshooting:

### If Website Not Loading:

```bash
# Check PM2 status
pm2 status

# Check logs for errors
pm2 logs dialexportmart --err --lines 100

# Check MongoDB connection
pm2 logs dialexportmart | grep -i "mongodb\|connection\|error"

# Restart if needed
pm2 restart dialexportmart
```

### If Database Connection Fails:

1. **Check .env file:**
   ```bash
   cat .env | grep MONGODB_URI
   ```

2. **Verify password encoding:**
   - Special characters should be URL encoded
   - Test connection string manually

3. **Check MongoDB Atlas:**
   - Verify IP whitelist
   - Check user permissions
   - Verify network access

### If Build Fails:

```bash
# Clear cache
rm -rf .next
rm -rf node_modules/.cache

# Reinstall dependencies
npm install

# Rebuild
npm run build
```

---

## 📝 Quick Reference Commands:

```bash
# 1. Change MongoDB password (Atlas Dashboard)
# 2. Update .env file
nano .env

# 3. Rebuild
npm run build

# 4. Restart
pm2 restart dialexportmart

# 5. Verify
pm2 logs dialexportmart --lines 50
curl https://www.dialexportmart.com
```

---

## ✅ Success Indicators:

After completing all steps:
- ✅ Website loads without redirects
- ✅ No malicious content in Google search
- ✅ Database connection successful
- ✅ PM2 running without errors
- ✅ Google Search Console shows clean URLs
- ✅ No new malicious products in database

---

## 🔐 Password Security Best Practices:

1. **Strong Password Requirements:**
   - Minimum 16 characters
   - Mix of uppercase, lowercase, numbers, special characters
   - No dictionary words
   - No personal information

2. **Password Examples (DO NOT USE - Create Your Own):**
   - ❌ `password123`
   - ❌ `admin123`
   - ✅ `MyS3cur3P@ssw0rd2024!`
   - ✅ `D3m@rt$ecur3P@ss!2024`

3. **Password Management:**
   - Use password manager (LastPass, 1Password, Bitwarden)
   - Never share passwords
   - Change passwords every 90 days
   - Use unique passwords for each service

---

## 🎉 Final Steps:

1. ✅ **Database cleanup** - Done (44 products deleted)
2. ✅ **Password change** - Follow steps above
3. ✅ **Website rebuild** - Follow steps above
4. ✅ **Go live** - Website should be working
5. ✅ **Monitor** - Check daily for first week

**Your website should be live and secure now!** 🚀
