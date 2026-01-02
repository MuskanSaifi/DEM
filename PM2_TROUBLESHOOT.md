# 🔍 PM2 Cluster Mode - Troubleshooting Guide

## ⚠️ Current Issue

PM2 status shows:
- ✅ Process 0: Healthy (0 restarts, online, 56.7mb)
- ❌ Process 1: 33 restarts, 0b memory
- ❌ Process 2: 32 restarts, status shows "0%" (not "online")
- ❌ Process 3: 32 restarts, status shows "0%" (not "online")

## 🔍 Diagnosis Steps

### 1. Check Error Logs
```bash
pm2 logs dialexportmart --err --lines 100
```

### 2. Check All Logs
```bash
pm2 logs dialexportmart --lines 50
```

### 3. Check Individual Process
```bash
pm2 show dialexportmart
```

### 4. Check if Port Conflict
```bash
netstat -tulpn | grep 3000
# or
ss -tulpn | grep 3000
```

## 🚨 Possible Causes

### 1. Next.js Standalone + Cluster Mode Issue
Next.js standalone mode might not work well with PM2 cluster mode because:
- Standalone creates a single server process
- Multiple instances might conflict
- Port binding issues

### 2. Port Binding Issue
All processes trying to bind to same port (3000)

### 3. Startup Crash
Processes crashing immediately on startup

## ✅ Solutions

### Solution 1: Use Fork Mode (Safer for Next.js Standalone)
If cluster mode is causing issues, use fork mode with fewer instances:

```javascript
// ecosystem.config.cjs
instances: 1,  // Single instance (safer for Next.js standalone)
exec_mode: "fork",
```

**Pros:**
- More stable for Next.js standalone
- No port conflicts
- Easier to debug

**Cons:**
- Uses only 1 CPU core
- Less load distribution

### Solution 2: Use Node Binary Directly (Better for Cluster Mode)
Instead of `npm start`, use the actual Node.js binary:

```javascript
// ecosystem.config.cjs
script: "./.next/standalone/server.js",  // Direct path to standalone server
// Remove: script: "npm", args: "start"
```

**Note:** This requires Next.js standalone build structure.

### Solution 3: Reduce Instances (Temporary Fix)
Try with 2 instances first:

```javascript
instances: 2,  // Start with 2, increase if stable
```

## 🎯 Recommended Fix

For Next.js standalone mode, **fork mode with 1 instance is safer**, but if you want multi-core:

**Option A: Fork Mode (Stable)**
```javascript
instances: 1,
exec_mode: "fork",
```

**Option B: Cluster Mode with Node Binary (Advanced)**
Change script to use Node directly (requires testing).

## 📝 Quick Fix Command

If you want to quickly test with fork mode:

```bash
# Stop all
pm2 delete dialexportmart

# Edit ecosystem.config.cjs to use fork mode (instances: 1, exec_mode: "fork")

# Restart
pm2 start ecosystem.config.cjs
pm2 save
pm2 status
```

## 🔍 Check Logs First

Before changing anything, check the logs to understand WHY processes are restarting:

```bash
pm2 logs dialexportmart --err --lines 100
```

This will show the actual error causing the restarts.

