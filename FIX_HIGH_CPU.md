# 🔥 High CPU Usage Fix - javae Process

## ⚠️ Problem Identified

`javae` process (PID 619) is using **514% CPU** - this is NOT your Next.js app!

## 🛠️ Immediate Fix Steps

### Step 1: Kill the High CPU Process

```bash
# Kill the javae process
kill -9 619

# Verify it's killed
ps aux | grep javae
```

### Step 2: Check for Other High CPU Processes

```bash
# Check all processes using CPU
top -b -n 1 | head -20

# Or find processes using >50% CPU
ps aux --sort=-%cpu | head -10
```

### Step 3: Check What javae Process Was

```bash
# Before killing, check what it was
ps aux | grep 619
# Or
cat /proc/619/cmdline
```

### Step 4: Find All Java/Node Processes

```bash
# Find all Java processes
ps aux | grep java

# Find all Node processes
ps aux | grep node

# Find all Next.js processes
ps aux | grep next
```

### Step 5: Kill All Unnecessary Processes

```bash
# Kill all Java processes (if not needed)
pkill -9 java

# Kill all old Node processes
pkill -9 node

# Kill all old Next.js processes
pkill -9 next-server
```

### Step 6: Clean Start Your Application

```bash
# Make sure no old processes are running
pm2 delete all
pm2 kill

# Wait a moment
sleep 2

# Check CPU usage now
top

# If CPU is normal, start your app
cd /path/to/your/project
pm2 start npm --name "dialexportmart" -- start
pm2 save
```

## 🔍 Identify the Problem Process

```bash
# Check what processes are using CPU
top -o %CPU

# Or use htop (if installed)
htop

# Check process tree
pstree -p | grep -A 5 -B 5 java
```

## 🎯 Complete Cleanup Script

```bash
#!/bin/bash
# cleanup.sh - Kill all high CPU processes

echo "🛑 Stopping all PM2 processes..."
pm2 delete all
pm2 kill

echo "🔍 Finding high CPU processes..."
HIGH_CPU=$(ps aux --sort=-%cpu | awk 'NR==2{print $2}')

if [ ! -z "$HIGH_CPU" ]; then
    CPU_USAGE=$(ps aux --sort=-%cpu | awk 'NR==2{print $3}')
    if (( $(echo "$CPU_USAGE > 50" | bc -l) )); then
        echo "⚠️  Killing process $HIGH_CPU using $CPU_USAGE% CPU"
        kill -9 $HIGH_CPU
    fi
fi

echo "🧹 Cleaning up Node/Java processes..."
pkill -9 node 2>/dev/null
pkill -9 java 2>/dev/null
pkill -9 next-server 2>/dev/null

echo "⏳ Waiting 5 seconds..."
sleep 5

echo "📊 Current CPU usage:"
top -b -n 1 | head -5

echo "✅ Cleanup complete!"
```

## 🔧 Prevent javae Process

The `javae` process might be:
1. **Java application** running on your server
2. **MongoDB** (if using Java-based tools)
3. **Other service** you installed

### Check What Services Are Running

```bash
# Check systemd services
systemctl list-units --type=service --state=running

# Check if MongoDB is using Java
ps aux | grep mongo

# Check cron jobs
crontab -l

# Check startup scripts
ls -la /etc/init.d/
```

## ✅ After Cleanup - Start Your App

```bash
# 1. Navigate to project
cd /path/to/your/project

# 2. Start with PM2
pm2 start npm --name "dialexportmart" -- start

# 3. Monitor
pm2 monit

# 4. Check CPU
top
```

## 📊 Expected Results

**Before:**
- javae: 514% CPU
- Load average: 5.12

**After:**
- Your Next.js app: <50% CPU
- Load average: <1.0

## ⚠️ Important Notes

1. **javae is NOT your Next.js app** - it's a separate Java process
2. **Kill it first** before starting your app
3. **Monitor** after starting to ensure CPU stays low
4. **Check** what javae was - might need to disable it permanently

## 🔍 Find What javae Is

```bash
# Check process details
ps -fp 619

# Check process working directory
ls -la /proc/619/cwd

# Check process command
cat /proc/619/cmdline | tr '\0' ' '

# Check if it's a system service
systemctl status | grep java
```

---

**Action Required**: Kill PID 619 immediately to reduce CPU usage!






