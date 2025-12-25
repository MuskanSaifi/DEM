/**
 * Global Error Handler
 * Ye file sab errors ko handle karti hai aur site ko crash hone se bachati hai
 */

// ✅ Only run in production/server environment
if (typeof window === "undefined") {
  // ✅ Uncaught Exception Handler
  process.on("uncaughtException", (error) => {
    console.error("❌ UNCAUGHT EXCEPTION! Shutting down...");
    console.error("Error:", error);
    console.error("Stack:", error.stack);
    
    // Log error but don't exit - let PM2 handle restart
    // Exiting here would prevent PM2 from restarting properly
  });

  // ✅ Unhandled Promise Rejection Handler
  process.on("unhandledRejection", (reason, promise) => {
    console.error("❌ UNHANDLED REJECTION!");
    console.error("Promise:", promise);
    console.error("Reason:", reason);
    
    // Log error but don't exit - let PM2 handle restart
  });

  // ✅ Memory Monitoring (Production only)
  if (process.env.NODE_ENV === "production") {
    setInterval(() => {
      const used = process.memoryUsage();
      const memoryMB = {
        rss: Math.round(used.rss / 1024 / 1024),
        heapTotal: Math.round(used.heapTotal / 1024 / 1024),
        heapUsed: Math.round(used.heapUsed / 1024 / 1024),
        external: Math.round(used.external / 1024 / 1024),
      };
      
      // Log if memory usage is high (warning threshold: 500MB)
      if (memoryMB.heapUsed > 500) {
        console.warn("⚠️ High memory usage detected:", memoryMB);
      }
      
      // Log if memory usage is very high (critical threshold: 700MB)
      if (memoryMB.heapUsed > 700) {
        console.error("🚨 CRITICAL: Very high memory usage:", memoryMB);
      }
    }, 60000); // Check every minute
  }

  // ✅ Graceful Shutdown Handlers
  const gracefulShutdown = (signal) => {
    console.log(`${signal} received, shutting down gracefully...`);
    // Close database connections, etc.
    process.exit(0);
  };

  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
  process.on("SIGINT", () => gracefulShutdown("SIGINT"));

  console.log("✅ Global error handlers initialized");
}
