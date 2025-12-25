# 🚨 COMPLETE XMRIG REMOVAL GUIDE

## ⚠️ CRITICAL: xmrig is installed as a Systemd Service!

Found xmrig files:
- `/etc/systemd/system/xmrig.service` - Systemd service file
- `/media/xmrig-6.24.0/xmrig` - Executable file
- Service is auto-starting on boot!

---

## 🔥 COMPLETE REMOVAL STEPS

### Step 1: Stop and Disable Systemd Service

```bash
# Stop the xmrig service
systemctl stop xmrig.service

# Disable it from auto-starting
systemctl disable xmrig.service

# Verify it's stopped
systemctl status xmrig.service
```

### Step 2: Kill Running xmrig Process

```bash
# Kill current process (PID 1249)
kill -9 1249

# Kill ALL xmrig processes
pkill -9 xmrig

# Verify it's killed
ps aux | grep xmrig | grep -v grep
```

### Step 3: Remove Systemd Service Files

```bash
# Remove service file
rm -f /etc/systemd/system/xmrig.service

# Remove symlink
rm -f /etc/systemd/system/multi-user.target.wants/xmrig.service

# Reload systemd
systemctl daemon-reload

# Verify service is gone
systemctl status xmrig.service
```

### Step 4: Delete xmrig Files

```bash
# Remove xmrig directory and all files
rm -rf /media/xmrig-6.24.0

# Verify files are deleted
find / -name "*xmrig*" 2>/dev/null
```

### Step 5: Check for Other Locations

```bash
# Search entire system for xmrig
find / -name "*xmrig*" 2>/dev/null

# Check common locations
ls -la /tmp/ | grep xmrig
ls -la /var/tmp/ | grep xmrig
ls -la /opt/ | grep xmrig
ls -la /usr/local/bin/ | grep xmrig
ls -la ~/ | grep xmrig
ls -la /root/ | grep xmrig
```

### Step 6: Check Cron Jobs (Again)

```bash
# Check all cron jobs
crontab -l
crontab -l -u root

# Check system cron directories
ls -la /etc/cron.d/
ls -la /etc/cron.hourly/
ls -la /etc/cron.daily/
ls -la /etc/cron.weekly/
ls -la /etc/cron.monthly/

# Search for xmrig in cron
grep -r "xmrig" /etc/cron* 2>/dev/null
```

### Step 7: Check Startup Scripts

```bash
# Check rc.local
cat /etc/rc.local

# Check profile files
cat ~/.bashrc | grep xmrig
cat ~/.bash_profile | grep xmrig
cat /root/.bashrc | grep xmrig
cat /root/.bash_profile | grep xmrig

# Check init.d
ls -la /etc/init.d/ | grep xmrig
```

### Step 8: Verify Complete Removal

```bash
# Check if xmrig process is running
ps aux | grep xmrig | grep -v grep

# Check if service exists
systemctl list-unit-files | grep xmrig

# Check if files exist
find / -name "*xmrig*" 2>/dev/null

# Check CPU usage
top
```

---

## ✅ ONE-LINE COMPLETE REMOVAL

```bash
systemctl stop xmrig.service && systemctl disable xmrig.service && kill -9 1249 && pkill -9 xmrig && rm -f /etc/systemd/system/xmrig.service && rm -f /etc/systemd/system/multi-user.target.wants/xmrig.service && rm -rf /media/xmrig-6.24.0 && systemctl daemon-reload && systemctl status xmrig.service
```

---

## 🔍 AFTER REMOVAL - Security Check

### 1. Check How It Got There

```bash
# Check system logs
journalctl -u xmrig.service | tail -50

# Check when it was installed
ls -la /etc/systemd/system/xmrig.service
ls -la /media/xmrig-6.24.0/

# Check auth logs for suspicious logins
tail -100 /var/log/auth.log
grep "Accepted password" /var/log/auth.log | tail -20
```

### 2. Check for Backdoors

```bash
# Check SSH authorized_keys
cat ~/.ssh/authorized_keys
cat /root/.ssh/authorized_keys

# Check for suspicious SSH keys
ls -la ~/.ssh/
ls -la /root/.ssh/

# Check sudoers
cat /etc/sudoers | grep -v "^#"
```

### 3. Change Passwords

```bash
# Change root password
passwd root

# Change user password
passwd
```

### 4. Update System

```bash
# Update all packages
apt update && apt upgrade -y
```

### 5. Install Security Tools

```bash
# Install fail2ban (protect SSH)
apt install fail2ban -y
systemctl enable fail2ban
systemctl start fail2ban

# Install rkhunter (rootkit detection)
apt install rkhunter -y
rkhunter --update
rkhunter --check
```

---

## 📊 Expected Results After Removal

**Before:**
- xmrig: 754.5% CPU
- CPU steal: 95.2%
- Load average: 7.05

**After:**
- xmrig: REMOVED ✅
- CPU usage: <50%
- Load average: <1.0

---

## 🚀 Restart Your Application

After removing xmrig:

```bash
# Check CPU is normal
top

# Navigate to project
cd /var/www/DEM  # or your project path

# Start your app
pm2 start npm --name "dialexportmart" -- start
pm2 save

# Monitor
pm2 monit
pm2 logs dialexportmart --lines 50
```

---

## ⚠️ IMPORTANT NOTES

1. **xmrig is a SYSTEMD SERVICE** - just killing process won't work, it will restart
2. **Must disable service** - `systemctl disable xmrig.service`
3. **Must delete files** - `/media/xmrig-6.24.0/` and service files
4. **Check how it got there** - security breach investigation needed
5. **Secure your server** - change passwords, update system, install fail2ban

---

## 🆘 If xmrig Keeps Coming Back

If xmrig restarts after removal:

1. **Check for other services** - `systemctl list-units --all | grep xmrig`
2. **Check for other locations** - `find / -name "*xmrig*" 2>/dev/null`
3. **Check for other users** - `ps aux | grep xmrig`
4. **Check network** - `netstat -tulpn | grep xmrig`
5. **Consider OS reinstall** - if heavily compromised

---

**ACTION REQUIRED**: Run all removal steps above to completely eliminate xmrig!


