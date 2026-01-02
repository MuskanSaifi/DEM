/**
 * PM2 Ecosystem Configuration
 * Auto-restart, memory limits, and error handling
 * Ye file site ko permanently chalne ke liye zaroori hai
 * .cjs extension use kiya hai kyunki package.json mein "type": "module" hai
 */
module.exports = {
  apps: [
    {
      name: "dialexportmart",
      script: "node",
      args: ".next/standalone/server.js", // ✅ Next.js standalone mode requires direct node execution
      cwd: process.cwd(),
      instances: 1, // ✅ Changed to 1 instance - MongoDB connection is bottleneck, not CPU
      exec_mode: "fork", // ✅ Fork mode - more stable with MongoDB connections
      
      // ✅ Auto-restart settings - CRITICAL
      autorestart: true,
      watch: false,
      max_memory_restart: "800M", // 800MB se zyada memory use hone par restart
      
      // ✅ Error handling
      error_file: "./logs/pm2-error.log",
      out_file: "./logs/pm2-out.log",
      log_file: "./logs/pm2-combined.log",
      time: true,
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,
      
      // ✅ Restart settings
      min_uptime: "10s", // Minimum 10 seconds uptime before considering stable
      max_restarts: 10, // Max 10 restarts in 1 minute
      restart_delay: 5000, // 5 seconds wait before restart
      
      // ✅ Environment variables
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      
      // ✅ Advanced settings
      kill_timeout: 5000, // 5 seconds for graceful shutdown
      listen_timeout: 10000, // 10 seconds wait for app to listen
      shutdown_with_message: true,
      
      // ✅ Health monitoring
      wait_ready: true,
      listen_timeout: 10000,
    },
  ],
};


