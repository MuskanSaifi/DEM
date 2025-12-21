# 🚨 URGENT: xmrig Process Kill Commands

## ⚠️ CRITICAL SECURITY ISSUE

**xmrig** process (PID 1187) is consuming **793.1% CPU** - this is a **cryptocurrency miner** that has hijacked your server!

This is **NOT a code issue** - your server has been compromised.

---

## 🔥 IMMEDIATE ACTIONS (Run These Commands NOW)

### Step 1: Kill xmrig Process Immediately

```bash
# Kill the xmrig process (PID 1187)
kill -9 1187

# Verify it's killed
ps aux | grep xmrig
```

### Step 2: Kill ALL xmrig Processes

```bash
# Kill all xmrig processes
pkill -9 xmrig

# Double check
ps aux | grep xmrig | grep -v grep
```

### Step 3: Check for Other Malicious Processes

```bash
# Check all high CPU processes
ps aux --sort=-%cpu | head -20

# Check for other miners
ps aux | grep -E "xmrig|minerd|cpuminer|stratum"
```

### Step 4: Find Where xmrig Came From

```bash
# Check process location
ls -la /proc/1187/exe
ls -la /proc/1187/cwd

# Check process command
cat /proc/1187/cmdline | tr '\0' ' '

# Check if it's in cron
crontab -l
crontab -l -u root

# Check systemd services
systemctl list-units --type=service | grep -i xmrig
```

### Step 5: Remove xmrig Files

```bash
# Find xmrig files
find / -name "*xmrig*" 2>/dev/null
find / -name "*miner*" 2>/dev/null

# Remove them (be careful!)
# First check what they are:
find / -name "*xmrig*" -exec ls -la {} \; 2>/dev/null

# Then remove:
find / -name "*xmrig*" -exec rm -rf {} \; 2>/dev/null
```

### Step 6: Check Cron Jobs

```bash
# Check all cron jobs
crontab -l
crontab -l -u root

# Check system cron
ls -la /etc/cron.d/
ls -la /etc/cron.hourly/
ls -la /etc/cron.daily/

# Check for suspicious entries
grep -r "xmrig\|miner\|stratum" /etc/cron* 2>/dev/null
```

### Step 7: Check Startup Scripts

```bash
# Check rc.local
cat /etc/rc.local

# Check init.d
ls -la /etc/init.d/ | grep -i xmrig

# Check systemd
systemctl list-unit-files | grep -i xmrig
```

### Step 8: Check Network Connections

```bash
# Check what xmrig is connecting to
netstat -tulpn | grep 1187
ss -tulpn | grep 1187

# Check all suspicious connections
netstat -tulpn | grep -E "xmrig|miner"
```

---

## 🛡️ SECURITY HARDENING (After Killing xmrig)

### 1. Change All Passwords

```bash
# Change root password
passwd root

# Change user passwords
passwd
```

### 2. Check for Backdoors

```bash
# Check authorized_keys
cat ~/.ssh/authorized_keys
cat /root/.ssh/authorized_keys

# Check for suspicious SSH keys
ls -la ~/.ssh/
ls -la /root/.ssh/

# Check sudoers
cat /etc/sudoers
```

### 3. Update System

```bash
# Update all packages
apt update && apt upgrade -y

# Or for CentOS/RHEL
yum update -y
```

### 4. Install Security Tools

```bash
# Install fail2ban
apt install fail2ban -y

# Install rkhunter (rootkit hunter)
apt install rkhunter -y
rkhunter --update
rkhunter --check

# Install chkrootkit
apt install chkrootkit -y
chkrootkit
```

### 5. Check Logs

```bash
# Check auth logs for suspicious logins
tail -100 /var/log/auth.log
grep "Failed password" /var/log/auth.log | tail -50

# Check system logs
journalctl -xe | tail -100
```

---

## 🔍 How xmrig Got There

Common ways xmrig gets installed:

1. **Weak SSH password** - brute force attack
2. **Unpatched vulnerabilities** - outdated software
3. **Malicious package** - compromised npm/node package
4. **Cron job** - scheduled to restart xmrig
5. **Systemd service** - auto-starts on boot

---

## ✅ After Cleanup - Restart Your App

```bash
# 1. Check CPU is normal
top

# 2. Start your Next.js app
cd /var/www/DEM  # or your project path
pm2 delete all
pm2 start npm --name "dialexportmart" -- start
pm2 save

# 3. Monitor
pm2 monit
top
```

---

## 📊 Expected Results

**Before:**
- xmrig: 793.1% CPU
- CPU steal: 95.7%
- Load average: 7.21

**After:**
- xmrig: KILLED ✅
- CPU usage: <50%
- Load average: <1.0

---

## ⚠️ IMPORTANT NOTES

1. **This is a SECURITY BREACH** - not a code issue
2. **Kill xmrig IMMEDIATELY** - it's stealing your server resources
3. **Find the source** - how did it get there?
4. **Secure your server** - change passwords, update system
5. **Monitor regularly** - check for xmrig returning

---

## 🆘 If xmrig Keeps Coming Back

If xmrig restarts after killing it:

1. **Check cron jobs** - it's probably scheduled
2. **Check systemd services** - it might auto-start
3. **Check startup scripts** - rc.local, init.d
4. **Check for backdoors** - SSH keys, etc.
5. **Consider reinstalling OS** - if heavily compromised

---

**ACTION REQUIRED**: Run `kill -9 1187` and `pkill -9 xmrig` NOW!

